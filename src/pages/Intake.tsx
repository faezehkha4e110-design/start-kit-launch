import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Intake = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectDescription: "",
    interfaceType: "",
    targetDataRate: "",
  });
  const [files, setFiles] = useState({
    schematic: null as File | null,
    stackup: null as File | null,
    layout: null as File | null,
  });

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles({ ...files, [field]: file });
  };

  const uploadFile = async (file: File, submissionId: string, fileType: string) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${submissionId}/${fileType}.${fileExt}`;
    
    const { error, data } = await supabase.storage
      .from('review-files')
      .upload(filePath, file, { upsert: true });

    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('review-files')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create submission record first
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          company: formData.company || null,
          project_description: formData.projectDescription,
          interface_type: formData.interfaceType || null,
          target_data_rate: formData.targetDataRate || null,
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Upload files if present
      const fileUrls: { [key: string]: string } = {};
      
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
        await supabase
          .from('submissions')
          .update(fileUrls)
          .eq('id', submission.id);
      }

      toast({
        title: "Submission received",
        description: "Thank you for submitting your design!",
      });

      // Show success message
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <div className="bg-card p-12 rounded-lg border border-border">
            <h1 className="text-3xl font-bold text-foreground mb-4">Thanks — your design has been submitted.</h1>
            <p className="text-lg text-muted-foreground">
              I'll review the files and get back to you by email with a preliminary SI/PI risk breakdown.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Start Your SI/PI Review</h1>
          <p className="text-muted-foreground">
            Share your design context and files so I can run an AI-assisted SI/PI review.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-lg border border-border">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company / Team</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Your company or team name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.projectDescription}
              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
              placeholder="What are you building and what are your main SI/PI concerns?"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interfaceType">Interface Type</Label>
            <Select value={formData.interfaceType} onValueChange={(value) => setFormData({ ...formData, interfaceType: value })}>
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
            <Input
              id="targetDataRate"
              value={formData.targetDataRate}
              onChange={(e) => setFormData({ ...formData, targetDataRate: e.target.value })}
              placeholder="e.g., 25 Gbps, 3200 MT/s"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schematic">Schematic (PDF/PNG/JPG)</Label>
            <Input
              id="schematic"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileChange('schematic', e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stackup">Stackup (PDF/PNG/JPG)</Label>
            <Input
              id="stackup"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileChange('stackup', e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="layout">Layout Snapshots (PDF/PNG/JPG)</Label>
            <Input
              id="layout"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileChange('layout', e.target.files?.[0] || null)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Intake;
