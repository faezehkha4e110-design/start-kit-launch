import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmissionNotificationRequest {
  name: string;
  email: string;
  company?: string;
  urgency_level: string;
  interface_type?: string;
  target_data_rate?: string;
  project_description: string;
  submission_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: SubmissionNotificationRequest = await req.json();
    console.log("Processing submission notification for submission:", data.submission_id);

    // Send notification to admin
    const adminEmail = await resend.emails.send({
      from: "SI/PI Review <onboarding@resend.dev>",
      to: ["faezeh@your-domain-here"],
      subject: "New SI/PI Review Submission",
      html: `
        <h2>New SI/PI Review Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Company:</strong> ${data.company || "N/A"}</p>
        <p><strong>Urgency:</strong> ${data.urgency_level}</p>
        <p><strong>Interface Type:</strong> ${data.interface_type || "N/A"}</p>
        <p><strong>Target Data Rate:</strong> ${data.target_data_rate || "N/A"}</p>
        <p><strong>Project Description:</strong></p>
        <p>${data.project_description}</p>
        <p><strong>Submission ID:</strong> ${data.submission_id}</p>
        <p>Files are stored in the review-files bucket under submission ID: ${data.submission_id}</p>
      `,
    });

    console.log("Admin email sent:", { id: adminEmail.data?.id, status: 'success' });

    // Send auto-response to user
    const userEmail = await resend.emails.send({
      from: "SI/PI Review <onboarding@resend.dev>",
      to: [data.email],
      subject: "Thanks for your SI/PI review request",
      html: `
        <h2>Thank you for your SI/PI review submission!</h2>
        <p>Hi ${data.name},</p>
        <p>I've received your design submission and will review the files carefully.</p>
        <p>You can expect to hear back from me with a preliminary SI/PI risk breakdown and next-step options.</p>
        <p>Based on your selected urgency level (${data.urgency_level}), I'll prioritize accordingly.</p>
        <br>
        <p>Best regards,</p>
        <p>Faezeh</p>
      `,
    });

    console.log("User email sent:", { id: userEmail.data?.id, status: 'success' });

    return new Response(
      JSON.stringify({ success: true, adminEmail, userEmail }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
