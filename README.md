# Lepark

<!-- `<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45">``</a>`

✨ Your new, shiny [Nx workspace](https://nx.dev) is almost ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/getting-started/tutorials/react-monorepo-tutorial?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed! -->

<!-- ## Finish your remote caching setup

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/0fAwxHqk1g) -->

## System Overview

Lepark introduces two interconnected web-based platforms: the Park Staff System and the Park Visitor System.

## How to locally deploy our system

1. **Download and install PostgreSQL and PostGIS**

   - For downloading PostgreSQL, follow the instructions for your operating system from the [PostgreSQL Download page](https://www.postgresql.org/download/).
   - For downloading PostGIS, follow the instructions for your operating system from the [PostGIS Getting Started page](https://postgis.net/documentation/getting_started/) at the "Installing PostGIS" section.
2. **Create a PostgreSQL database locally:**
3. **Create a `.env` file in the root folder that contains:**

   ```env
   DATABASE_URL="postgresql://[username]:[password]@localhost:5432/[databaseName]"
   AWS_ACCESS_KEY_ID="[yourAWSAccessKey]"
   AWS_SECRET_ACCESS_KEY="[yourAWSSecretAccessKey]"
   ```

   - Replace `[username]`, `[password]`, and `[databaseName]` with your PostgreSQL credentials.
   - Replace `[yourAWSAccessKey]` and `[yourAWSSecretAccessKey]` with your AWS Credentials for your S3 bucket.
4. **In the root folder, run:**

   ```
   npm install
   ```
5. **In the root folder, run:**

   ```bash
   npx prisma migrate dev
   ```
6. **Preload accounts, parks, zones, species and occurrences by running**

   ```bash
   node apps/backend/src/utils/seed.js
   ```
7. **To start the system, run:**

   ```bash
   nx run-many --target=serve --parallel=100
   ```
8. **To access the different systems:**

   - Staff: [http://localhost:4200/](http://localhost:4200/)
   - Visitor: [http://localhost:4201/](http://localhost:4201/)
9. **Login to Staff system using Superadmin:**

   - Email: superadmin@lepark.com
   - Password: password
10. **Note:**

    - If you want to test Reset Password, you have to use a real email account when signing up.

<!-- To create a production bundle:

```sh
npx nx build staff-frontend
```

To see all available targets to run for a project, run:

```sh
npx nx show project staff-frontend
``` -->

<!-- These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs »](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/react:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/react:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins »](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry »](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console »](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/react-monorepo-tutorial?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) -->
