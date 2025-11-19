import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Submission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string | null;
  urgency_level: string;
  interface_type: string | null;
  project_description: string;
  nda_required: boolean;
  schematic_url: string | null;
  stackup_url: string | null;
  layout_url: string | null;
}

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndLoadSubmissions();
  }, []);

  const checkAdminAndLoadSubmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        console.error('Error checking admin role:', roleError);
        toast({
          title: "Error",
          description: "Unable to verify permissions.",
          variant: "destructive",
        });
        navigate("/intake");
        return;
      }

      if (!roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/intake");
        return;
      }

      setIsAdmin(true);

      // Load all submissions
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage SI/PI review submissions</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Submissions</CardTitle>
            <CardDescription>View and manage all SI/PI review requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Interface</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>NDA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      {new Date(submission.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>{submission.company || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={submission.urgency_level.includes("Rush") ? "destructive" : "default"}>
                        {submission.urgency_level}
                      </Badge>
                    </TableCell>
                    <TableCell>{submission.interface_type || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {submission.schematic_url && <Badge variant="outline">Sch</Badge>}
                        {submission.stackup_url && <Badge variant="outline">Stk</Badge>}
                        {submission.layout_url && <Badge variant="outline">Lay</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.nda_required ? "✓" : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {submissions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No submissions yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;