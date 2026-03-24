import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Chip, Grid, CircularProgress, Alert } from '@mui/material';
import { Work, School, Stars, Assignment, CardMembership } from '@mui/icons-material';

interface LinkedInData {
  name?: string;
  headline?: string;
  location?: string;
  experience?: {
    headers: string[];
    items: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
  };
  education?: {
    headers: string[];
    items: Array<{
      school: string;
      degree: string;
      field: string;
      duration: string;
    }>;
  };
  skills?: {
    headers: string[];
    items: Array<{
      skill: string;
      endorsements: string;
    }>;
  };
  projects?: {
    headers: string[];
    items: Array<{
      name: string;
      description: string;
      url: string;
    }>;
  };
  certifications?: {
    headers: string[];
    items: Array<{
      name: string;
      issuer: string;
      date: string;
    }>;
  };
}

const LinkedInProfile: React.FC = () => {
  const [profileData, setProfileData] = useState<LinkedInData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Use the environment variable with fallback
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${apiUrl}/api/linkedin/profile-data`);
        if (!response.ok) {
          throw new Error('Failed to fetch LinkedIn data');
        }
        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!profileData) {
    return (
      <Box m={2}>
        <Alert severity="info">No profile data available</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        {/* Basic Information */}
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {profileData.name}
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {profileData.headline}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {profileData.location}
            </Typography>
          </CardContent>
        </Card>

        {/* Experience */}
        {profileData.experience?.items && (
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Work sx={{ mr: 1 }} /> Experience
            </Typography>
            {profileData.experience.items.map((exp, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{exp.title}</Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    {exp.company}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {exp.duration}
                  </Typography>
                  <Typography variant="body1">{exp.description}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Education */}
        {profileData.education?.items && (
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <School sx={{ mr: 1 }} /> Education
            </Typography>
            {profileData.education.items.map((edu, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{edu.school}</Typography>
                  <Typography variant="subtitle1">{edu.degree}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {edu.field} • {edu.duration}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Skills */}
        {profileData.skills?.items && (
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Stars sx={{ mr: 1 }} /> Skills
            </Typography>
            <Card>
              <CardContent>
                <Grid container spacing={1}>
                  {profileData.skills.items.map((skill, index) => (
                    <Grid item key={index}>
                      <Chip
                        label={`${skill.skill} (${skill.endorsements})`}
                        variant="outlined"
                        sx={{ m: 0.5 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Projects */}
        {profileData.projects?.items && (
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Assignment sx={{ mr: 1 }} /> Projects
            </Typography>
            {profileData.projects.items.map((project, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{project.name}</Typography>
                  <Typography variant="body1">{project.description}</Typography>
                  {project.url && (
                    <Typography variant="body2" color="primary" component="a" href={project.url} target="_blank">
                      View Project
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Certifications */}
        {profileData.certifications?.items && (
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CardMembership sx={{ mr: 1 }} /> Certifications
            </Typography>
            {profileData.certifications.items.map((cert, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{cert.name}</Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    {cert.issuer}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {cert.date}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default LinkedInProfile; 