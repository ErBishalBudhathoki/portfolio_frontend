import { fetchWithRetry, fetchWithValidation } from '@/lib/fetchWithRetry';
import Link from 'next/link';
import Image from 'next/image';

// Set this page to be dynamically rendered
export const dynamic = 'force-dynamic';

async function getBlogsData() {
  try {
    // Get the base URL from environment, or use relative URL for custom domains
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    console.log("Blogs page - Base API URL:", apiUrl);
    
    // Remove timestamp for better caching
    const relativeUrl = `/api/profile`;
    console.log("Blogs page - Using URL:", relativeUrl);
    
    interface ApiResponse {
      blogs: any[];
      [key: string]: any;
    }
    
    // Use the enhanced fetch with validation to ensure we have blogs data
    try {
      const data = await fetchWithValidation<ApiResponse>(relativeUrl, {
        next: { revalidate: 60 }, // Revalidate every 60 seconds
      }, (data) => {
        // Validate that we have blogs data
        return data && data.blogs && data.blogs.length > 0;
      });
      
      console.log(`Blogs page - Received ${data.blogs?.length || 0} blogs from API`);
      
      if (data.blogs && data.blogs.length > 0) {
        return data.blogs;
      }
    } catch (error) {
      console.error("Error with relative URL fetch:", error);
      
      // Try direct backend URL as fallback
      if (apiUrl) {
        const directBackendUrl = `${apiUrl}/api/profile`;
        const directData = await fetchWithValidation<ApiResponse>(directBackendUrl, {
          next: { revalidate: 60 }, // Revalidate every 60 seconds
        }, (data) => {
          // Validate that we have blogs data
          return data && data.blogs && data.blogs.length > 0;
        });
        
        console.log(`Blogs page - Received ${directData.blogs?.length || 0} blogs from direct API call`);
        
        if (directData.blogs && directData.blogs.length > 0) {
          return directData.blogs;
        }
      }
    }
    
    console.log("Blogs page - No blogs found in API response");
    return [];
  } catch (error) {
    console.error("Error fetching blogs data:", error);
    return [];
  }
}

export default async function BlogsPage() {
  // Fetch blog data using our enhanced fetch with retry logic
  const blogs = await getBlogsData();
  
  return (
    <div className="container px-4 py-8 md:py-12 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Blog Posts</h1>
      
      {blogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">No blog posts found</p>
          <p className="text-md text-muted-foreground">Check back later for new content</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog: any, index: number) => (
            <Link 
              key={blog.id || index} 
              href={blog.link || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <div className="bg-muted/30 border border-muted/50 rounded-lg overflow-hidden h-full transition-transform duration-300 hover:scale-[1.02] hover:shadow-md flex flex-col">
                {blog.image && (
                  <div className="w-full h-48 overflow-hidden relative">
                    <Image 
                      src={blog.image}
                      alt={blog.title}
                      fill
                      unoptimized={true}
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        // Provide a fallback for broken images
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = "/images/blog-placeholder.jpg";
                      }}
                    />
                  </div>
                )}
                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-xl font-semibold mb-2 text-foreground">{blog.title}</h2>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{blog.description || blog.excerpt || ""}</p>
                  <div className="mt-auto flex items-center">
                    <div className="text-xs text-muted-foreground">
                      {blog.date && (
                        <span>{new Date(blog.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      )}
                      {blog.reading_time && (
                        <span className="ml-2">· {blog.reading_time} min read</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 