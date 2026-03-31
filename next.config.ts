import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This tells Next.js to dump a static HTML/CSS/JS output folder instead of requiring a Node.js server
  output: 'export',
  
  // UNCOMMENT the following line if you host this inside a repository namespace rather than a custom domain name!
  // Example: If your site is https://your_name.github.io/row_row/, the basePath must exactly match the repository name.
  // basePath: '/row_row',
};

export default nextConfig;
