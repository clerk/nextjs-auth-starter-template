<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_docs" target="_blank" rel="noopener noreferrer">
   <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./public/light-logo.png">
      <img src="./public/dark-logo.png" height="64">
    </picture>
  </a>
  <br />
</p>
<div align="center">
  <h1>
    Clerk and Next.js App Router template
  </h1>
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
  <img alt="Clerk Hero Image" src="public/og.png">
</div>

## Introduction

Clerk is a developer-first authentication and user management solution. It provides pre-built React components and hooks for sign-in, sign-up, user profile, and organization management. Clerk is designed to be easy to use and customize, and can be dropped into any React or Next.js application.

This template allows you to get started with Clerk and Next.js (App Router) in a matter of minutes, and demonstrates features of Clerk such as:

- Fully functional auth flow with sign-in, sign-up, and a protected page
- Customized Clerk components with Tailwind CSS
- Hooks for accessing user data and authentication state
- Organizations for multi-tenant applications

## Demo

A hosted demo of this example is available at https://clerk-nextjs-app-router.vercel.app/

## Deploy

Easily deploy the template to Vercel with the button below. You will need to set the required environment variables in the Vercel dashboard.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fclerk%2Fclerk-nextjs-demo-app-router&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,NEXT_PUBLIC_CLERK_SIGN_IN_URL,NEXT_PUBLIC_CLERK_SIGN_UP_URL&envDescription=Clerk%20API%20keys&envLink=https%3A%2F%2Fclerk.com%2Fdocs%2Fquickstart%2Fnextjs)

## Running the template

```bash
git clone https://github.com/clerk/clerk-nextjs-demo-app-router
```

To run the example locally, you need to:

1. Sign up for a Clerk account at [https://clerk.com](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=template_repos&utm_campaign=nextjs_template).
2. Go to the [Clerk dashboard](https://dashboard.clerk.com?utm_source=github&utm_medium=template_repos&utm_campaign=nextjs_template) and create an application.
3. Set the required Clerk environment variables as shown in [the example `env` file](./.env.template).
4. Go to "Organization Settings" in your sidebar and enable Organizations
5. `npm install` the required dependencies.
6. `npm run dev` to launch the development server.

## Learn more

To learn more about Clerk and Next.js, check out the following resources:

- [Quickstart: Get started with Next.js and Clerk](https://clerk.com/docs/quickstarts/nextjs?utm_source=github&utm_medium=template_repos&utm_campaign=nextjs_template)
- [Clerk Documentation](https://clerk.com/docs?utm_source=github&utm_medium=template_repos&utm_campaign=nextjs_template)
- [Next.js Documentation](https://nextjs.org/docs)

## Found an issue or have feedback?

If you have found an issue with this repo or have feedback, please join our Discord and create a new thread inside of our [support](https://discord.gg/zjhYsWuSwD) channel.

If it's a quick fix, such as a misspelled word or a broken link, feel free to skip creating a thread.
Go ahead and create a [pull request](https://github.com/clerk/clerk-nextjs-demo-app-router/pulls) with the solution. :rocket:

## Connect with us

You can discuss ideas, ask questions, and meet others from the community in our [Discord](https://discord.com/invite/b5rXHjAg7A).

If you prefer, you can also find support through our [Twitter](https://twitter.com/ClerkDev), or you can [email](mailto:support@clerk.dev) us!
