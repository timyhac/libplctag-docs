# Website

This repository is a test of using Docusaurus, Github Pages and Github Actions to host a documentation site.
As a test case it was set up to host a copy of the wiki for libplctag - the real/live/up-to-date version of that is hosted here: https://github.com/libplctag/libplctag/wiki

What follows is the standard README content for a Docusaurus site:

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
