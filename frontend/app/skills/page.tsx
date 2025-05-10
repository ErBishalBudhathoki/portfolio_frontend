'use client';

import React, { useState, useEffect } from 'react';
import {
Code,
Github,
Globe,
Database,
Layout,
Terminal,
Workflow,
Users,
Megaphone,
BrainCircuit,
ClockIcon,
Puzzle,
Server,
Lightbulb,
Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter } from 'next/navigation';
import Loading from '../loading';
import { useApi } from '@/hooks/useApi';

// Define types for profile data
interface Skill {
name: string;
category: string;
endorsements: number;
proficiency?: number; // Keep for backward compatibility
icon?: string;
color?: string;
}

interface SkillsObject {
technical?: string[];
soft?: string[];
}

interface ProfileData {
basic_info?: {
name?: string;
headline?: string;
location?: string;
profile_image?: string;
};
skills?: SkillsObject | Skill[] | string[];
experience?: any[];
education?: any[];
projects?: any[];
}

// Define an interface for the API response
interface ApiResponse {
skills: Skill[];
[key: string]: any;
}

// Icon mapping for categories
const categoryIcons: Record<string, React.ReactNode> = {
"Frontend": <Layout className="h-6 w-6 text-accent-foreground" />,
"Backend": <Server className="h-6 w-6 text-accent-foreground" />,
"Database": <Database className="h-6 w-6 text-accent-foreground" />,
"DevOps/Cloud": <Workflow className="h-6 w-6 text-accent-foreground" />,
"AI/ML": <BrainCircuit className="h-6 w-6 text-accent-foreground" />,
"Other": <Globe className="h-6 w-6 text-accent-foreground" />
};

// Friendly names for categories
const categoryNames: Record<string, string> = {
"Frontend": "Frontend Development",
"Backend": "Backend Development",
"Database": "Database & Data",
"DevOps/Cloud": "DevOps & Cloud",
"AI/ML": "AI & Machine Learning",
"Other": "Other Skills"
};

// Function to group skills by category
function groupSkillsByCategory(skills: Skill[]): Record<string, Skill[]> {
const categories: Record<string, Skill[]> = {};

skills.forEach((skill) => {
const category = skill.category || 'Other';
if (!categories[category]) {
categories[category] = [];
}
categories[category].push(skill);
});

// Sort categories by name
return Object.fromEntries(
Object.entries(categories).sort(([a], [b]) => a.localeCompare(b))
);
}

function getDefaultSkills(): Skill[] {
return [
{ name: "JavaScript", category: "Frontend", endorsements: 0 },
{ name: "TypeScript", category: "Frontend", endorsements: 0 },
{ name: "React", category: "Frontend", endorsements: 0 },
{ name: "Next.js", category: "Frontend", endorsements: 0 },
{ name: "Node.js", category: "Backend", endorsements: 0 },
{ name: "Python", category: "Backend", endorsements: 0 },
{ name: "FastAPI", category: "Backend", endorsements: 0 },
{ name: "HTML", category: "Frontend", endorsements: 0 },
{ name: "CSS", category: "Frontend", endorsements: 0 },
{ name: "Tailwind CSS", category: "Frontend", endorsements: 0 },
{ name: "MongoDB", category: "Database", endorsements: 0 },
{ name: "PostgreSQL", category: "Database", endorsements: 0 },
{ name: "Git", category: "DevOps/Cloud", endorsements: 0 },
{ name: "Docker", category: "DevOps/Cloud", endorsements: 0 },
];
}

function getDefaultSkillsByCategory(): Record<string, Skill[]> {
return {
"Frontend": [
{ name: "JavaScript", category: "Frontend", endorsements: 32 },
{ name: "TypeScript", category: "Frontend", endorsements: 28 },
{ name: "React", category: "Frontend", endorsements: 26 },
{ name: "Next.js", category: "Frontend", endorsements: 18 },
{ name: "HTML", category: "Frontend", endorsements: 29 },
{ name: "CSS", category: "Frontend", endorsements: 24 },
{ name: "Tailwind CSS", category: "Frontend", endorsements: 20 }
],
"Backend": [
{ name: "Node.js", category: "Backend", endorsements: 22 },
{ name: "Python", category: "Backend", endorsements: 19 },
{ name: "FastAPI", category: "Backend", endorsements: 12 },
{ name: "Express", category: "Backend", endorsements: 16 },
{ name: "REST API", category: "Backend", endorsements: 18 }
],
"Database": [
{ name: "MongoDB", category: "Database", endorsements: 17 },
{ name: "PostgreSQL", category: "Database", endorsements: 14 },
{ name: "MySQL", category: "Database", endorsements: 12 },
{ name: "Firebase", category: "Database", endorsements: 9 }
],
"DevOps/Cloud": [
{ name: "Git", category: "DevOps/Cloud", endorsements: 25 },
{ name: "Docker", category: "DevOps/Cloud", endorsements: 13 },
{ name: "AWS", category: "DevOps/Cloud", endorsements: 11 },
{ name: "CI/CD", category: "DevOps/Cloud", endorsements: 10 }
],
"Other": []
};
}

// Helper function to categorize skills for legacy format
function categorizeSkillsLegacy(skills: Skill[]): Record<string, Skill[]> {
const categories: Record<string, Skill[]> = {};

// Define default categories
const defaultCategories = [
"Frontend", "Backend", "Database", "DevOps/Cloud", "AI/ML", "Other"
];

// Initialize categories
defaultCategories.forEach(category => {
categories[category] = [];
});

// Categorize skills based on keywords
skills.forEach(skill => {
const skillName = typeof skill === 'string' ? skill : skill.name;
const skillObj = typeof skill === 'string'
? { name: skill, category: 'Other', endorsements: 0 }
: skill;

// Try to infer category based on skill name if not specified
if (!skillObj.category || skillObj.category === '') {
const name = skillObj.name.toLowerCase();

if (/react|vue|angular|javascript|typescript|html|css|tailwind|bootstrap|jquery|dom|sass|less|gulp|webpack|vite|frontend|ui|component/i.test(name)) {
skillObj.category = 'Frontend';
} else if (/node|express|django|flask|fastapi|python|ruby|rails|go|dotnet|rest|api|backend|server/i.test(name)) {
skillObj.category = 'Backend';
} else if (/sql|mysql|postgresql|mongodb|database|db|data|orm|firebase|redis|graphql|query/i.test(name)) {
skillObj.category = 'Database';
} else if (/aws|azure|gcp|cloud|docker|kubernetes|jenkins|cicd|vercel|netlify|heroku|devops|git/i.test(name)) {
skillObj.category = 'DevOps/Cloud';
} else if (/tensorflow|pytorch|machine learning|ml|ai|nlp|gpt|model|neural|algorithm/i.test(name)) {
skillObj.category = 'AI/ML';
} else {
skillObj.category = 'Other';
}
}

// Ensure the category exists before pushing to it
// First, validate that skillObj.category is a valid key and is defined
if (skillObj.category && typeof skillObj.category === 'string') {
// Make sure we have an array initialized for this category
if (!categories[skillObj.category]) {
// If this category wasn't in our default list, initialize it
categories[skillObj.category] = [];
}
// Now it's safe to push
categories[skillObj.category].push(skillObj);
} else {
// If category is undefined or invalid, default to 'Other'
if (!categories['Other']) {
categories['Other'] = [];
}
skillObj.category = 'Other';
categories['Other'].push(skillObj);
}
});

// Remove empty categories
return Object.fromEntries(
Object.entries(categories)
.filter(([_, skills]) => skills.length > 0)
.sort(([a], [b]) => a.localeCompare(b))
);
}

// --- Skillicons.dev integration ---
const skillIconIds = [
"ableton","activitypub","actix","adonis","ae","aiscript","alpinejs","anaconda","androidstudio","angular","ansible","apollo","apple","appwrite","arch","arduino","astro","atom","au","autocad","aws","azul","azure","babel","bash","bevy","bitbucket","blender","bootstrap","bsd","bun","c","cs","cpp","crystal","cassandra","clion","clojure","cloudflare","cmake","codepen","coffeescript","css","cypress","d3","dart","debian","deno","devto","discord","bots","discordjs","django","docker","dotnet","dynamodb","eclipse","elasticsearch","electron","elixir","elysia","emacs","ember","emotion","express","fastapi","fediverse","figma","firebase","flask","flutter","forth","fortran","gamemakerstudio","gatsby","gcp","git","github","githubactions","gitlab","gmail","gherkin","go","gradle","godot","grafana","graphql","gtk","gulp","haskell","haxe","haxeflixel","heroku","hibernate","html","htmx","idea","ai","instagram","ipfs","java","js","jenkins","jest","jquery","kafka","kali","kotlin","ktor","kubernetes","laravel","latex","less","linkedin","linux","lit","lua","md","mastodon","materialui","matlab","maven","mint","misskey","mongodb","mysql","neovim","nestjs","netlify","nextjs","nginx","nim","nix","nodejs","notion","npm","nuxtjs","obsidian","ocaml","octave","opencv","openshift","openstack","p5js","perl","ps","php","phpstorm","pinia","pkl","plan9","planetscale","pnpm","postgres","postman","powershell","pr","prisma","processing","prometheus","pug","pycharm","py","pytorch","qt","r","rabbitmq","rails","raspberrypi","react","reactivex","redhat","redis","redux","regex","remix","replit","rider","robloxstudio","rocket","rollupjs","ros","ruby","rust","sass","spring","sqlite","stackoverflow","styledcomponents","sublime","supabase","scala","sklearn","selenium","sentry","sequelize","sketchup","solidity","solidjs","svelte","svg","swift","symfony","tailwind","tauri","tensorflow","terraform","threejs","twitter","ts","ubuntu","unity","unreal","v","vala","vercel","vim","visualstudio","vite","vitest","vscode","vscodium","vue","vuetify","wasm","webflow","webpack","webstorm","windicss","windows","wordpress","workers","xd","yarn","yew","zig"
];

const skillNameToIconId: Record<string, string> = {
// Programming Languages
"JavaScript": "js",
"TypeScript": "ts",
"Python": "python",
"Java": "java",
"C": "c",
"C#": "cs",
"C++": "cpp",
"Core Java": "java",
"Python Programming": "python",
"Java Programming": "java",

// Mobile Development
"Android": "androidstudio",
"Kotlin": "kotlin",
"Flutter": "flutter",
"Android Development": "androidstudio",
"Mobile Development": "androidstudio",
"Android (Java)": "java",
"Android Studio": "androidstudio",
"Android Testing": "androidstudio",
"Mobile Interface Design": "figma",

// Frontend
"React": "react",
"React.js": "react",
"Next.js": "nextjs",
"HTML": "html",
"CSS": "css",
"Tailwind CSS": "tailwind",
"Document Object Model (DOM)": "html",
"Frontend Development": "react",
"XML": "html",
"Web Development": "html",

// Backend
"Node.js": "nodejs",
"Express": "express",
"REST API": "nodejs",
"REST APIs": "nodejs",
"FastAPI": "fastapi",
"Firebase": "firebase",
"Authentication": "nodejs",
"Password Hashing": "nodejs",
"Caching": "redis",

// Databases
"MongoDB": "mongodb",
"PostgreSQL": "postgresql",
"MySQL": "mysql",
"SQL": "mysql",
"Database Management": "mysql",

// Cloud Platform
"AWS": "aws",
"Google Cloud Infrastructure": "gcp",
"Google Cloud": "gcp",
"Cloud Computing": "aws",

// DevOps Tools
"Git": "git",
"Github": "github",
"Docker": "docker",
"CI/CD": "github",
"BitBucket": "bitbucket",
"Version Control": "git",

// Machine Learning & AI
"Machine Learning": "pytorch",
"ML APIs": "tensorflow",
"Generative AI": "python",
"Responsible AI": "python",
"AI Security": "python",
"Artificial Intelligence": "python",
"Deep Learning": "tensorflow",

// Security
"Information & Cybersecurity": "linux",
"Cracking": "linux",
"Security": "linux",

// Development Tools
"VS Code": "vscode",
"Visual Studio": "visualstudio",
"PyCharm": "pycharm",
"IntelliJ IDEA": "idea",
"Eclipse": "eclipse",
};

export default function SkillsPage() {
const { data: profileData, error: apiError, isLoading: isApiLoading } = useApi<ProfileData>('/profile', {
dedupingInterval: 300000,
});

const isLoading = isApiLoading;
const error = apiError ? "Failed to load skills. Please try again later." : null;

// Store the processed skills data in state to prevent loss on re-render
const [processedSkills, setProcessedSkills] = React.useState<Record<string, Skill[]> | null>(null);
const [iconLoadError, setIconLoadError] = React.useState<string | null>(null);
const [iconLoadSuccess, setIconLoadSuccess] = React.useState(false);

// Process skills data from profile and store in state
React.useEffect(() => {
console.log('Processing profile data:', profileData);
const skills = !profileData || !profileData.skills
? getDefaultSkillsByCategory()
: Array.isArray(profileData.skills)
? categorizeSkillsLegacy(
typeof profileData.skills[0] === 'string'
? (profileData.skills as string[]).map((name: string) => ({
name,
category: 'Other',
endorsements: 0
}))
: (profileData.skills as Skill[])
)
: categorizeSkillsLegacy(
[
...(profileData.skills as SkillsObject).technical?.map((name: string) => ({
name,
category: 'Frontend',
endorsements: 0
})) || [],
...(profileData.skills as SkillsObject).soft?.map((name: string) => ({
name,
category: 'Other',
endorsements: 0
})) || []
]
);

console.log('Setting processed skills:', skills);
setProcessedSkills(skills);
}, [profileData]);

// Generate icon URL from processed skills
const { technicalSkills, iconUrl } = React.useMemo(() => {
console.log('Starting icon URL generation...');

if (!processedSkills) {
console.log('No processed skills available');
return { technicalSkills: [], iconUrl: null };
}

// Update category mapping to include all technical categories
const categoryMapping: Record<string, string> = {
"Artificial Intelligence": "AI/ML",
"Backend Development": "Backend",
"Frontend Development": "Frontend",
"Cloud Platform": "DevOps/Cloud",
"DevOps Tool": "DevOps/Cloud",
"Database": "Database",
"Programming Languages": "Languages",
"Mobile Development": "Mobile",
"Software Development": "Development",
"Development Tools": "DevTools",
"Programming": "Languages",
"Mobile Application Development": "Mobile",
"Web Development": "Frontend",
// Add any other categories from your profile
};

// Log all available categories for debugging
console.log('Available categories in skills data:', Object.keys(processedSkills));

const technicalCategories = Object.keys(categoryMapping);
console.log('Technical categories to process:', technicalCategories);
console.log('Current skills data:', processedSkills);

// Get all technical skills with category mapping
const technicalSkills = Object.entries(processedSkills)
.flatMap(([category, skills]) => {
console.log(`Processing category ${category} with ${skills.length} skills:`, skills);
// Include all skills, not just from mapped categories
return skills.map(skill => ({
...skill,
category: categoryMapping[category] || category
}));
});

console.log('All technical skills found:', technicalSkills);

// Map to icon IDs with detailed logging
const iconSkills = technicalSkills
.map(skill => {
const iconId = skillNameToIconId[skill.name];
console.log(`Mapping skill "${skill.name}" to icon ID:`, iconId,
iconId ? `(Valid: ${skillIconIds.includes(iconId)})` : '(No mapping found)');
return iconId;
})
.filter((iconId, index, self) => {
const isValid = iconId && skillIconIds.includes(iconId);
console.log(`Validating icon ID "${iconId}":`, isValid ? 'Valid' : 'Invalid');
return isValid && self.indexOf(iconId) === index;
});

console.log('Final valid icon IDs:', iconSkills);

// Generate URL with detailed logging
let finalUrl = null;
if (iconSkills.length > 0) {
finalUrl = `https://skillicons.dev/icons?i=${iconSkills.join(",")}&theme=dark`;
console.log('Generated icon URL:', finalUrl);
} else {
console.log('No valid icon IDs found to generate URL');
}

return {
technicalSkills,
iconUrl: finalUrl
};
}, [processedSkills]);

// Add image loading debug
const handleImageLoad = () => {
console.log('Skill icons loaded successfully');
setIconLoadSuccess(true);
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
console.error('Error loading skill icons:', e);
setIconLoadError('Failed to load skill icons');
};

// Log render state
React.useEffect(() => {
console.log('Component render state:', {
isLoading,
error,
hasProcessedSkills: !!processedSkills,
technicalSkillsCount: technicalSkills?.length,
hasIconUrl: !!iconUrl,
iconUrl,
iconLoadError,
iconLoadSuccess
});
}, [isLoading, error, processedSkills, technicalSkills, iconUrl, iconLoadError, iconLoadSuccess]);

if (isLoading) {
return <Loading />;
}

if (error) {
return (
<div className="container mx-auto px-4 py-16 text-center">
<h1 className="text-3xl font-bold mb-4">Oops!</h1>
<p className="mb-8">{error}</p>
<button
onClick={() => window.location.reload()}
className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
>
Try Again
</button>
</div>
);
}

return (
<div className="bg-gradient-to-b from-background via-background to-background/90 dark:from-[#0a0f2a] dark:via-[#101835] dark:to-[#0a0f2a]/90 min-h-screen pb-16">
<div className="absolute inset-0 z-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none"></div>

{/* Header with Animated Background */}
<div className="relative overflow-hidden py-16">
<div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden z-0">
<div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
<div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
<div className="absolute top-1/2 left-1/2 w-96 h-96 bg-violet-500/10 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
</div>

<div className="container mx-auto px-4 relative z-10">
<div className="max-w-4xl mx-auto text-center">
<div className="inline-flex items-center justify-center p-1 px-3 mb-5 border border-accent-foreground/30 rounded-full bg-accent-foreground/5 text-accent-foreground text-sm font-medium backdrop-blur-sm">
<Code className="w-4 h-4 mr-2" />
Technical Competencies
</div>

<h1 className="text-4xl md:text-6xl font-bold text-center text-foreground mb-8 tracking-tight">
Skills & <span className="text-primary dark:text-[#6370ff]">Expertise</span>
</h1>

<p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
A comprehensive overview of my technical skills and professional capabilities
developed through years of practical experience.
</p>
</div>
</div>
</div>

<div className="container mx-auto px-4 relative z-10">
{/* Technical Stack Icons Section */}
<div className="max-w-4xl mx-auto mb-16">
<div className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-8 shadow-xl">
<h3 className="text-xl font-bold mb-6 text-foreground text-center">Technical Stack</h3>
<div className="flex justify-center items-center min-h-[100px]">
{iconUrl ? (
<div className="relative group">
<a href={iconUrl} target="_blank" rel="noopener noreferrer"
className="block hover:opacity-90 transition-opacity bg-background/50 p-4 rounded-xl">
<img
src={iconUrl}
alt="Technical Skills Icons"
className="max-w-full h-auto"
onError={handleImageError}
onLoad={handleImageLoad}
/>
</a>
{iconLoadError && (
<p className="text-red-500 text-sm mt-2 text-center">{iconLoadError}</p>
)}
</div>
) : (
<div className="text-center text-muted-foreground">
<p className="text-lg font-medium">
{isLoading ? 'Loading skill icons...' : 'Processing skills...'}
</p>
<p className="text-sm mt-2">Technical skills found: {technicalSkills?.length || 0}</p>
{technicalSkills?.length > 0 && (
<div className="mt-2 text-sm text-muted-foreground/80">
<p>Available skills:</p>
<p className="text-xs mt-1">{technicalSkills.map(s => s.name).join(', ')}</p>
<p className="text-xs mt-1">Icon URL: {iconUrl || 'Not generated'}</p>
</div>
)}
</div>
)}
</div>
</div>
</div>

{/* Main Content */}
<div className="max-w-6xl mx-auto">
{/* Category Tabs */}
<div className="flex flex-wrap justify-center gap-3 mb-12">
{processedSkills && Object.keys(processedSkills).map((category) => (
<div
key={category}
className="px-5 py-2.5 rounded-full border border-border/60 bg-card/50 backdrop-blur-sm
hover:bg-primary/10 hover:border-primary/60 hover:text-primary
transition-all duration-300 text-muted-foreground font-medium cursor-pointer"
>
<div className="flex items-center gap-2">
<span className="w-5 h-5">{getCategoryIcon(category)}</span>
<span>{getCategoryFriendlyName(category)}</span>
</div>
</div>
))}
</div>

{/* Skills Cards with Grid Layout */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
{processedSkills && Object.entries(processedSkills).map(([category, skills]) => (
<div
key={category}
className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden
shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-500"
>
{/* Card Header with Curved Design */}
<div className="relative h-24 overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
<div className="absolute -bottom-12 left-0 right-0 h-20 bg-card/90 rounded-[50%_50%_0_0] border-t border-border/20"></div>

<div className="absolute top-6 left-6 flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shadow-md">
{getCategoryIcon(category)}
</div>
<h2 className="text-xl font-bold text-foreground">{getCategoryFriendlyName(category)}</h2>
</div>
</div>

{/* Skills List */}
<div className="p-6 pt-4 space-y-4">
{skills.map((skill) => (
<div key={skill.name} className="group relative">
{/* Skill Name and Level */}
<div className="flex justify-between items-center mb-2">
<span className="text-foreground font-medium group-hover:text-primary transition-colors duration-300">
{skill.name}
</span>
<span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${getLevelBadgeClass(skill.endorsements)}`}>
{getEndorsementLabel(skill.endorsements)}
</span>
</div>

{/* Animated Progress Bar */}
<div className="h-2 bg-background/80 rounded-full overflow-hidden">
<div
className="h-full rounded-full origin-left transform transition-all duration-1000 ease-out group-hover:scale-x-105"
style={{
width: `${getEndorsementPercentage(skill.endorsements)}%`,
background: getEndorsementGradient(skill.endorsements)
}}
></div>
</div>
</div>
))}
</div>
</div>
))}
</div>

{/* Experience Duration Cards */}
<div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
{[
{ area: "Frontend", years: "5+", icon: <Layout className="h-5 w-5" />, color: "from-blue-500/20 to-blue-600/10" },
{ area: "Backend", years: "4+", icon: <Server className="h-5 w-5" />, color: "from-violet-500/20 to-violet-600/10" },
{ area: "Database", years: "3+", icon: <Database className="h-5 w-5" />, color: "from-pink-500/20 to-pink-600/10" },
{ area: "DevOps", years: "2+", icon: <Workflow className="h-5 w-5" />, color: "from-amber-500/20 to-amber-600/10" }
].map((item, index) => (
<div
key={index}
className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-xl p-4
hover:border-primary/30 transition-all group cursor-default flex items-center"
>
<div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mr-4`}>
{item.icon}
</div>
<div>
<h3 className="text-muted-foreground text-sm font-medium">{item.area}</h3>
<p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
{item.years} <span className="text-base font-normal">Years</span>
</p>
</div>
</div>
))}
</div>

{/* Methodology Section */}
<div className="mt-16 bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl shadow-xl p-8">
<div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
<h3 className="text-xl font-bold flex items-center">
<Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
Skill Assessment Methodology
</h3>

<div className="flex items-center space-x-4">
{[
{ level: "Expert", color: "bg-emerald-500" },
{ level: "Advanced", color: "bg-blue-500" },
{ level: "Intermediate", color: "bg-amber-500" },
{ level: "Beginner", color: "bg-violet-500" }
].map((item, i) => (
<div key={i} className="flex items-center gap-1.5">
<div className={`w-2 h-2 rounded-full ${item.color}`}></div>
<span className="text-xs text-muted-foreground">{item.level}</span>
</div>
))}
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div className="space-y-4">
<div className="space-y-2">
<h4 className="font-medium text-foreground">How Skills Are Assessed:</h4>
<p className="text-muted-foreground text-sm leading-relaxed">
Skills are evaluated based on LinkedIn endorsements from colleagues and peers,
reflecting real-world recognition of expertise in each technology or skill area.
</p>
</div>

<div className="space-y-2">
<h4 className="font-medium text-foreground">Endorsement Scale:</h4>
<div className="h-2 w-full bg-background rounded-full overflow-hidden">
<div className="h-full w-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500"></div>
</div>
<div className="flex justify-between text-xs text-muted-foreground">
<span>Beginner</span>
<span>Intermediate</span>
<span>Advanced</span>
<span>Expert</span>
</div>
</div>
</div>

<div className="grid grid-cols-2 gap-4">
{[
{ label: "Expert (30+ endorsements)", desc: "Widely recognized expertise", color: "border-l-emerald-500" },
{ label: "Advanced (15-29 endorsements)", desc: "Proven skill competency", color: "border-l-blue-500" },
{ label: "Intermediate (5-14 endorsements)", desc: "Demonstrated capability", color: "border-l-amber-500" },
{ label: "Beginner (0-4 endorsements)", desc: "Foundational knowledge", color: "border-l-violet-500" }
].map((item, i) => (
<div key={i} className={`border-l-2 ${item.color} pl-3 py-1`}>
<h5 className="text-sm font-medium text-foreground">{item.label}</h5>
<p className="text-xs text-muted-foreground">{item.desc}</p>
</div>
))}
</div>
</div>
</div>
</div>
</div>
</div>
);
}

// Helper function for getting category icon
function getCategoryIcon(category: string) {
return categoryIcons[category] || <Code className="h-6 w-6 text-accent-foreground" />;
}

// Helper function for getting category name
function getCategoryFriendlyName(category: string) {
return categoryNames[category] || category;
}

// Helper to get a endorsement label
function getEndorsementLabel(endorsements: number): string {
if (endorsements >= 30) return "Expert";
if (endorsements >= 15) return "Advanced";
if (endorsements >= 5) return "Intermediate";
return "Beginner";
}

// Helper to get endorsement color based on endorsement level
function getEndorsementColor(endorsements: number): string {
if (endorsements >= 30) return "text-emerald-500";
if (endorsements >= 15) return "text-blue-500";
if (endorsements >= 5) return "text-amber-500";
return "text-violet-500";
}

// Helper to get badge background color for endorsement
function getEndorsementBadgeColor(endorsements: number): string {
if (endorsements >= 30) return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
if (endorsements >= 15) return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
if (endorsements >= 5) return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
return "bg-violet-500/10 text-violet-500 border border-violet-500/20";
}

// Helper function to get endorsement gradient based on endorsement level
function getEndorsementGradient(endorsements: number): string {
if (endorsements >= 30) return "linear-gradient(90deg, #059669, #10b981)";
if (endorsements >= 15) return "linear-gradient(90deg, #2563eb, #3b82f6)";
if (endorsements >= 5) return "linear-gradient(90deg, #d97706, #f59e0b)";
return "linear-gradient(90deg, #7c3aed, #8b5cf6)";
}

// Helper function to get level badge class based on endorsement
function getLevelBadgeClass(endorsements: number): string {
if (endorsements >= 30) return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
if (endorsements >= 15) return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
if (endorsements >= 5) return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
return "bg-violet-500/10 text-violet-500 border border-violet-500/20";
}

// Helper function to convert endorsement count to a percentage for the progress bar
function getEndorsementPercentage(endorsements: number): number {
// For 0 endorsements, show empty bar
if (endorsements === 0) return 0;

// For 1-4 endorsements (Beginner): 10-25%
if (endorsements < 5) {
return 10 + (endorsements * 3.75);
}

// For 5-14 endorsements (Intermediate): 25-50%
if (endorsements < 15) {
return 25 + ((endorsements - 5) * 2.5);
}

// For 15-29 endorsements (Advanced): 50-90%
if (endorsements < 30) {
return 50 + ((endorsements - 15) * 2.66);
}

// For 30+ endorsements (Expert): 90-100%
return Math.min(90 + ((endorsements - 30) * 0.33), 100);
}