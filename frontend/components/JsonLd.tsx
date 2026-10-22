import React from 'react';

type JsonLdProps = {
  data: Record<string, any> | Array<Record<string, any>>;
};

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function PersonJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://bishalbudhathoki.com/#person',
        name: 'Bishal Budhathoki',
        givenName: 'Bishal',
        familyName: 'Budhathoki',
        jobTitle: 'Software Engineer',
        description:
          'Software Engineer & Full-Stack Developer based in Sydney, Australia specializing in Flutter, Kotlin, Android, iOS, React, Next.js, Node.js, Python, and Cloud microservices.',
        url: 'https://bishalbudhathoki.com',
        image: 'https://bishalbudhathoki.com/images/01.png',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Sydney',
          addressRegion: 'New South Wales',
          addressCountry: 'AU',
        },
        sameAs: [
          'https://github.com/ErBishalBudhathoki',
          'https://www.linkedin.com/in/bishalbudhathoki/',
          'https://x.com/bis2vis',
        ],
        knowsAbout: [
          'Software Engineering',
          'Mobile Application Development',
          'Full-Stack Web Development',
          'Flutter',
          'Dart',
          'Kotlin',
          'Android SDK',
          'iOS App Development',
          'React.js',
          'Next.js',
          'TypeScript',
          'JavaScript',
          'Python',
          'FastAPI',
          'Node.js',
          'Express',
          'Java',
          'PostgreSQL',
          'MongoDB',
          'Firebase',
          'Google Cloud Platform',
          'Docker',
          'CI/CD Pipelines',
          'NDIS Software Systems',
        ],
        alumniOf: [
          {
            '@type': 'CollegeOrUniversity',
            name: 'CQUniversity Australia',
            sameAs: 'https://www.cqu.edu.au',
          },
          {
            '@type': 'EducationalOrganization',
            name: 'QIBA (Professional Year)',
          },
          {
            '@type': 'CollegeOrUniversity',
            name: 'SJC Institute of Technology',
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://bishalbudhathoki.com/#website',
        name: 'Bishal Budhathoki Portfolio',
        url: 'https://bishalbudhathoki.com',
        description:
          'Professional portfolio website of Bishal Budhathoki showcasing projects, skills, articles, and software engineering experience.',
        publisher: {
          '@id': 'https://bishalbudhathoki.com/#person',
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'ProfilePage',
        '@id': 'https://bishalbudhathoki.com/#profilepage',
        url: 'https://bishalbudhathoki.com',
        name: 'Bishal Budhathoki | Software Engineer & Full-Stack Developer',
        mainEntity: {
          '@id': 'https://bishalbudhathoki.com/#person',
        },
      },
    ],
  };

  return <JsonLd data={schema} />;
}
