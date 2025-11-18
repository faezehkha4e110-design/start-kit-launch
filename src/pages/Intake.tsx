import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Intake = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectDescription: "",
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
          project_description: formData.projectDescription,
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
        description: "Redirecting to chat interface...",
      });

      // Navigate to chat with submission data
      navigate('/chat', { state: { submissionId: submission.id, formData } });
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Submit Your Review Request</h1>
          <p className="text-muted-foreground">
            Fill out the form below to get started with your SI/PI analysis.
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
            <Label htmlFor="email">Email *</Label>
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
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.projectDescription}
              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
              placeholder="Describe your project, interfaces (DDR, PCIe, SerDes), and any specific concerns..."
              rows={4}
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
            {isSubmitting ? "Submitting..." : "Submit Review Request"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Intake;
