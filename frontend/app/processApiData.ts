import { ProfileData, BasicInfo, Experience, Education, Project, Skills } from './types';

/**
 * Process API data into the format expected by the frontend
 */
export function processApiData(apiData: any): ProfileData {
  console.log(`Processing API data (first 500 chars): ${JSON.stringify(apiData).substring(0, 500)}...`);
  
  // ====== Process basic info ======
  const basicInfo: BasicInfo = {
    name: apiData?.basic_info?.name || apiData?.name || 'No Name',
    headline: apiData?.basic_info?.headline || apiData?.headline || apiData?.title || 'Developer',
    location: apiData?.basic_info?.location || apiData?.location || 'Location',
    profile_image_url: '/images/01.png' // Always use local image
  };
  
  console.log('Processed basic info:', JSON.stringify(basicInfo));
  
  // ====== Map experience data, handling different field names ======
  const experience: Experience[] = [];
  
  if (Array.isArray(apiData?.experience)) {
    console.log(`Processing ${apiData.experience.length} experience items`);
    
    apiData.experience.forEach((exp: any, index: number) => {
      console.log(`Experience item ${index}:`, JSON.stringify(exp));
      
      // Try to handle both 'title' and 'role' fields
      const title = exp.title || exp.role || exp.position || 'Unknown Position';
      console.log(`Using title: ${title} (from fields: ${exp.title ? 'title' : ''}${exp.role ? 'role' : ''}${exp.position ? 'position' : ''})`);
      
      experience.push({
        company: exp.company || exp.organization || 'Unknown Company',
        title: title,
        date_range: exp.date_range || exp.dates || exp.period || 'Unknown Date',
        description: exp.description || exp.summary || '',
        technologies: exp.technologies || exp.tech || exp.tools || []
      });
    });
  } else {
    console.log('No experience data found in API response');
  }
  
  console.log(`Mapped ${experience.length} experience items`);
  if (experience.length > 0) {
    console.log(`First experience item: ${JSON.stringify(experience[0])}`);
  }
  
  // ====== Process education data ======
  const education: Education[] = Array.isArray(apiData?.education) 
    ? apiData.education.map((edu: any) => ({
        institution: edu.institution || edu.school || edu.university || 'Unknown Institution',
        degree: edu.degree || edu.qualification || 'Unknown Degree',
        field: edu.field || edu.major || edu.subject || '',
        date_range: edu.date_range || edu.dates || edu.period || 'Unknown Date'
      }))
    : [];
  
  // ====== Process skills data, separating technical and soft skills ======
  let technicalSkills: string[] = [];
  let softSkills: string[] = [];
  
  console.log('Processing skills data:', JSON.stringify(apiData?.skills));
  
  if (apiData?.skills) {
    // Try to process categorized skills
    if (Array.isArray(apiData.skills)) {
      console.log('Skills is an array with', apiData.skills.length, 'items');
      
      // If skills is an array of objects with category property
      apiData.skills.forEach((skill: any, index: number) => {
        console.log(`Skill ${index}:`, JSON.stringify(skill));
        
        if (typeof skill === 'object') {
          // Extract the name
          const skillName = skill.name || skill.skill || '';
          if (!skillName) {
            console.log(`Skipping skill ${index} - no name found`);
            return;
          }
          
          // Determine the category
          const category = (skill.category || '').toLowerCase();
          console.log(`Skill ${skillName} has category: ${category}`);
          
          if (category.includes('technical') || 
              category.includes('tech') || 
              category.includes('hard') ||
              category.includes('frontend') || 
              category.includes('backend')) {
            technicalSkills.push(skillName);
            console.log(`Added ${skillName} to technical skills`);
          } else if (category.includes('soft') || 
                    category.includes('personal') ||
                    category.includes('interpersonal')) {
            softSkills.push(skillName);
            console.log(`Added ${skillName} to soft skills`);
          } else {
            // Default to technical if no category or unknown
            technicalSkills.push(skillName);
            console.log(`Added ${skillName} to technical skills (default)`);
          }
        } else if (typeof skill === 'string') {
          // If it's just a string, assume technical
          technicalSkills.push(skill);
          console.log(`Added string skill ${skill} to technical skills`);
        }
      });
    } else if (typeof apiData.skills === 'object') {
      console.log('Skills is an object with properties:', Object.keys(apiData.skills));
      
      // If skills is an object with categories as properties
      if (Array.isArray(apiData.skills.technical)) {
        technicalSkills = apiData.skills.technical;
        console.log(`Added ${technicalSkills.length} items from skills.technical`);
      }
      if (Array.isArray(apiData.skills.soft)) {
        softSkills = apiData.skills.soft;
        console.log(`Added ${softSkills.length} items from skills.soft`);
      }
    }
  } else {
    console.log('No skills data found in API response');
  }
  
  // ====== Process projects ======
  const projects: Project[] = Array.isArray(apiData?.projects) 
    ? apiData.projects.map((proj: any) => ({
        title: proj.title || proj.name || 'Unknown Project',
        description: proj.description || proj.summary || '',
        image_url: proj.image_url || proj.image || '',
        link: proj.link || proj.url || proj.github || '',
        technologies: proj.technologies || proj.tech || proj.tools || []
      }))
    : [];
  
  // ====== Construct the processed data ======
  const processedData: ProfileData = {
    basic_info: basicInfo,
    experience: experience,
    education: education,
    skills: {
      technical: technicalSkills,
      soft: softSkills
    },
    projects: projects,
    cv_url: apiData?.cv_url || apiData?.resume_url || ''
  };
  
  // ====== Log summary of processed data ======
  console.log('Processed data summary:');
  console.log(`- Basic info: ${processedData.basic_info.name}`);
  console.log(`- Experience items: ${processedData.experience.length}`);
  console.log(`- Skills: ${processedData.skills.technical.length} technical, ${processedData.skills.soft.length} soft`);
  console.log(`- Projects: ${processedData.projects.length}`);
  
  return processedData;
}

/**
 * Helper to get profile image URL from different possible field names
 */
function getProfileImageUrl(apiData: any): string {
  console.log('Looking for profile image in API data');
  
  // Check different possible field names for the profile image
  const possibleFields = [
    'profile_image_url',
    'profileImageUrl',
    'profile_image',
    'profileImage',
    'image',
    'picture',
    'avatar'
  ];
  
  // Check basic_info object first
  if (apiData?.basic_info) {
    for (const field of possibleFields) {
      if (apiData.basic_info[field]) {
        console.log(`Found profile image in basic_info.${field}:`, apiData.basic_info[field]);
        return apiData.basic_info[field];
      }
    }
  }
  
  // Then check top level
  for (const field of possibleFields) {
    if (apiData?.[field]) {
      console.log(`Found profile image in ${field}:`, apiData[field]);
      return apiData[field];
    }
  }
  
  // Default image if none found
  console.log('No profile image found, using default');
  return '/images/01.png';
} 