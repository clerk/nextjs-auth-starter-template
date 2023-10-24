<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_docs" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>
<div align="center">
  <h1>
    Clerk and Next.js App Router template
  </h1>
  <h3>More than authentication.<br />Complete user management.</h3>
  <a href="https://www.npmjs.com/package/@clerk/clerk-js">
    <img alt="" src="https://img.shields.io/npm/dm/@clerk/clerk-js" />
  </a>
  <a href="https://discord.com/invite/b5rXHjAg7A">
    <img alt="Discord" src="https://img.shields.io/discord/856971667393609759?color=7389D8&label&logo=discord&logoColor=ffffff" />
  </a>
  <a href="https://twitter.com/clerkdev">
    <img alt="Twitter" src="https://img.shields.io/twitter/url.svg?label=%40clerkdev&style=social&url=https%3A%2F%2Ftwitter.com%2Fclerkdev" />
  </a> 
  <br />
  <br />
  <img alt="Clerk Hero Image" src="https://github.com/clerkinc/clerk-docs/blob/df9c607030f351d359c752e2a237664cfb098ba9/public/images/home/docs-hero-light.svg">
</div>

## Introduction

Clerk is a developer-first authentication and user management solution. It provides pre-built React components and hooks for sign-in, sign-up, user profile, and organization management. Clerk is designed to be easy to use and customize, and can be dropped into any React or Next.js application.

This template allows you to get started with Clerk and Next.js (App Router) in a matter of minutes, and demonstrates features of Clerk such as:

- Fully functional auth flow with sign-in, sign-up, and a protected page
- Customized Clerk components with Tailwind CSS
- Hooks for accessing user data and authentication state
- Organizations for multi-tenant applications

## Demo

A hosted demo of this example is available at [clerk-nextjs-template.vercel.app](https://clerk-nextjs-template.vercel.app/)

## Deploy

Easily deploy the template to Vercel with the button below. You will need to set the required environment variables in the Vercel dashboard.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fclerkinc%2Fclerk-next-app&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY&envDescription=Clerk%20API%20keys&envLink=https%3A%2F%2Fclerk.com%2Fdocs%2Fnextjs%2Fget-started-with-nextjs%23set-environment-keys&redirect-url=https%3A%2F%2Fclerk.com%2Fdocs%2Fnextjs%2Fget-started-with-nextjs)

## Running the template

```bash
git clone https://github.com/clerkinc/clerk-next-app
```

To run the example locally, you need to:

1. Sign up for a Clerk account at [https://clerk.com](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=template_repos&utm_campaign=nextjs_template).
2. Go to the [Clerk dashboard](https://dashboard.clerk.com?utm_source=github&utm_medium=template_repos&utm_campaign=nextjs_template) and create an application.
3. Set the required Clerk environment variables as shown in [the example `env` file](./.env.template).
4. `npm install` the required dependencies.
5. `npm run dev` to launch the development server.

## Learn more

To learn more about Clerk and Next.js, check out the following resources:

- [Quickstart: Get started with Next.js and Clerk](https://clerk.com/docs/quickstarts/nextjs?utm_source=github&utm_medium=template_repos&utm_campaign=nextjs_template)
- [Clerk Documentation](https://clerk.com/docs?utm_source=github&utm_medium=template_repos&utm_campaign=nextjs_template)
- [Next.js Documentation](https://nextjs.org/docs)

## Contact

If you need support or have anything you would like to ask, please reach out in our [Discord channel](https://discord.com/invite/b5rXHjAg7A). We'd love to chat!
