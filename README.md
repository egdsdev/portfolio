# Portfolio

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.8.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## GitHub Pages

The canonical GitHub Pages routine is:

```bash
npm run pages:check
```

This command:

- builds the app with the correct base href for `/portfolio/`
- writes the static output directly to `docs/`
- creates a `404.html` fallback for Angular routes on GitHub Pages
- creates `.nojekyll` and fails fast if the Pages bundle is incomplete

The workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) validates this bundle on pull requests and deploys it on pushes to `main`.

One-time repository setting: in GitHub Pages, set **Source** to **GitHub Actions**. The workflow now fails fast if the repository is switched back to branch-based publishing, because that is what caused the `404 File not found` state.
