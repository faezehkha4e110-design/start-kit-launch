import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

const submissionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  company: z.string().trim().max(200, 'Company name must be less than 200 characters').optional(),
  projectDescription: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be less than 5000 characters'),
  interfaceType: z.string().optional(),
  targetDataRate: z.string().trim().max(100, 'Data rate must be less than 100 characters').optional(),
  ndaRequired: z.boolean(),
  urgencyLevel: z.enum(['Standard (3–5 business days)', 'Faster review if possible', 'Just exploring options']),
  preferredResponseTime: z.string().optional()
});

const Intake = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectDescription: "",
    interfaceType: "",
    targetDataRate: "",
    ndaRequired: false,
    urgencyLevel: "Standard (3–5 business days)",
    preferredResponseTime: ""
  });
  const [files, setFiles] = useState({
    schematic: null as File | null,
    stackup: null as File | null,
    layout: null as File | null
  });
  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          variant: "destructive"
        });
        return;
      }
      
      // Validate MIME type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF, PNG, or JPEG files only",
          variant: "destructive"
        });
        return;
      }
    }
    
    setFiles({
      ...files,
      [field]: file
    });
  };
  const uploadFile = async (file: File, submissionId: string, fileType: string) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${submissionId}/${fileType}.${fileExt}`;
    const {
      error,
      data
    } = await supabase.storage.from('review-files').upload(filePath, file, {
      upsert: true
    });
    if (error) throw error;
    const {
      data: urlData
    } = supabase.storage.from('review-files').getPublicUrl(filePath);
    return urlData.publicUrl;
  };
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    setIsCheckingAuth(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!user) {
        throw new Error("You must be signed in to submit");
      }

      // Validate form data
      const validationResult = submissionSchema.safeParse(formData);
      if (!validationResult.success) {
        toast({
          title: "Validation Error",
          description: validationResult.error.errors[0].message,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const validData = validationResult.data;

      // Create submission record first with validated data
      const {
        data: submission,
        error: submissionError
      } = await supabase.from('submissions').insert({
        user_id: user.id,
        name: validData.name,
        email: validData.email,
        company: validData.company || null,
        project_description: validData.projectDescription,
        interface_type: validData.interfaceType || null,
        target_data_rate: validData.targetDataRate || null,
        nda_required: validData.ndaRequired,
        urgency_level: validData.urgencyLevel,
        preferred_response_time: validData.preferredResponseTime || null
      }).select().single();
      if (submissionError) throw submissionError;

      // Upload files if present
      const fileUrls: {
        [key: string]: string;
      } = {};
      if (files.schematic) {
        fileUrls.schematic_url = await uploadFile(files.schematic, submission.id, 'schematic');
      }
      if (files.stackup) {
        fileUrls.stackup_url = await uploadFile(files.stackup, submission.id, 'stackup');
      }
      if (files.layout) {
        fileUrls.layout_url = await uploadFile(files.layout, submission.id, 'layout');
      }

      // Update submission with file URLs
      if (Object.keys(fileUrls).length > 0) {
        await supabase.from('submissions').update(fileUrls).eq('id', submission.id);
      }

      // Send email notifications
      try {
        await supabase.functions.invoke('send-submission-notification', {
          body: {
            name: validData.name,
            email: validData.email,
            company: validData.company,
            urgency_level: validData.urgencyLevel,
            project_description: validData.projectDescription,
            submission_id: submission.id
          }
        });
        console.log("Email notifications sent successfully");
      } catch (emailError) {
        console.error("Error sending email notifications:", emailError);
        // Don't fail the submission if email fails
      }
      toast({
        title: "Submission received",
        description: "Thank you for submitting your design!"
      });

      // Show success message
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isCheckingAuth) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>;
  }
  
  if (isSubmitted) {
    return <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <a 
            href="https://eternawave.ae" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Eternawave</span>
          </a>
        </div>
      </header>
      
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <div className="bg-card p-12 rounded-lg border border-border">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Design Submitted Successfully</h1>
            <p className="text-lg text-muted-foreground">
              The Eternawave SI/PI engineering team will review your files and follow up at the email you provided with a preliminary risk breakdown and next-step options.
            </p>
            <a 
              href="https://eternawave.ae" 
              className="inline-block mt-8 text-primary hover:underline"
            >
              Return to eternawave.ae →
            </a>
          </div>
        </div>
      </div>
    </div>;
  }

  return <div className="min-h-screen bg-background">
    {/* Minimal Header */}
    <header className="border-b border-border">
      <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <a 
          href="https://eternawave.ae" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Eternawave</span>
        </a>
        <Button onClick={handleSignOut} variant="outline" size="sm">Sign Out</Button>
      </div>
    </header>

    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="text-primary font-medium mb-2 tracking-wide uppercase text-sm">SI/PI Brain</p>
        <h1 className="text-4xl font-bold text-foreground mb-4">Submit Your Design for Review</h1>
        <p className="text-muted-foreground text-lg">
          Share your design context and files for an AI-assisted SI/PI analysis by the Eternawave engineering team.
        </p>
      </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-lg border border-border">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" required value={formData.name} onChange={e => setFormData({
            ...formData,
            name: e.target.value
          })} placeholder="Your full name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work Email *</Label>
            <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({
            ...formData,
            email: e.target.value
          })} placeholder="your.email@company.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company / Team</Label>
            <Input id="company" value={formData.company} onChange={e => setFormData({
            ...formData,
            company: e.target.value
          })} placeholder="Your company or team name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description *</Label>
            <Textarea id="description" required value={formData.projectDescription} onChange={e => setFormData({
            ...formData,
            projectDescription: e.target.value
          })} placeholder="What are you building and what are your main SI/PI concerns?" rows={4} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interfaceType">Interface Type</Label>
            <Select value={formData.interfaceType} onValueChange={value => setFormData({
            ...formData,
            interfaceType: value
          })}>
              <SelectTrigger id="interfaceType">
                <SelectValue placeholder="Select interface type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DDR4">DDR4</SelectItem>
                <SelectItem value="DDR5">DDR5</SelectItem>
                <SelectItem value="PCIe Gen4">PCIe Gen4</SelectItem>
                <SelectItem value="PCIe Gen5">PCIe Gen5</SelectItem>
                <SelectItem value="PCIe Gen6">PCIe Gen6</SelectItem>
                <SelectItem value="SerDes 56G">SerDes 56G</SelectItem>
                <SelectItem value="SerDes 112G">SerDes 112G</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDataRate">Target Data Rate</Label>
            <Input id="targetDataRate" value={formData.targetDataRate} onChange={e => setFormData({
            ...formData,
            targetDataRate: e.target.value
          })} placeholder="e.g., 25 Gbps, 3200 MT/s" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schematic">Schematic (PDF/PNG/JPG)</Label>
            <Input id="schematic" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileChange('schematic', e.target.files?.[0] || null)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stackup">Stackup (PDF/PNG/JPG)</Label>
            <Input id="stackup" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileChange('stackup', e.target.files?.[0] || null)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="layout">Layout Snapshots (PDF/PNG/JPG)</Label>
            <Input id="layout" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileChange('layout', e.target.files?.[0] || null)} />
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox id="nda" required checked={formData.ndaRequired} onCheckedChange={checked => setFormData({
              ...formData,
              ndaRequired: checked === true
            })} />
              <div className="space-y-1">
                <Label htmlFor="nda" className="font-normal cursor-pointer">
                  Eternawave can sign an NDA before you share sensitive details if needed. *
                </Label>
                <p className="text-sm text-muted-foreground">
                  Check this if you require an NDA. The team will follow up by email.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgencyLevel">Urgency Level *</Label>
            <Select required value={formData.urgencyLevel} onValueChange={value => setFormData({
            ...formData,
            urgencyLevel: value
          })}>
              <SelectTrigger id="urgencyLevel">
                <SelectValue placeholder="Select urgency level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard (3–5 business days)">Standard (3–5 business days)</SelectItem>
                <SelectItem value="Faster review if possible">Faster review if possible</SelectItem>
                <SelectItem value="Just exploring options">Just exploring options</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredResponseTime">Preferred Response Time</Label>
            <Select value={formData.preferredResponseTime} onValueChange={value => setFormData({
            ...formData,
            preferredResponseTime: value
          })}>
              <SelectTrigger id="preferredResponseTime">
                <SelectValue placeholder="Select preferred response time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Within 24–48 hours">Within 24–48 hours</SelectItem>
                <SelectItem value="Within 3–5 days">Within 3–5 days</SelectItem>
                <SelectItem value="Flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-6 space-y-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              All uploaded schematics, stackups, and layouts remain confidential and are used solely for SI/PI analysis by Eternawave. Your files are never shared with third parties.
            </p>
            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : "Submit for Review"}
            </Button>
          </div>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-8">
          Questions? Contact <a href="mailto:support@eternawave.ae" className="text-primary hover:underline">support@eternawave.ae</a>
        </p>
      </div>
    </div>;
};
export default Intake;