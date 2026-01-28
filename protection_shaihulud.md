Platform

Resources

Company
Pricing
Evo
New
EN
Select your language
Login
Want to try it for yourself?
NPM Security Best Practices: How to Protect Your Packages After the 2025 Shai Hulud Attack
Written by
Headshot of Liran Tal
Liran Tal
22 mins read
Attacks like Shai-Hulud, Nx, event-stream, colors, node-ipc, and others demonstrate that package managers serve as an execution engine, not just a library downloader. We must treat third-party dependency management with vigilance and ensure that proper security controls are in place.
The following is a curated, practical, security‑focused npm package manager hardening list of recommended practices for secure local development and open source software maintainers' processes. Keep this open next to your terminal.
The following are key highlights of security practices, tools, and domains in which we lay out responsible usage for developers and open source maintainers alike:
Safe‑by‑default CLI options for npm, pnpm, Bun, Yarn, Deno
Supply‑chain hardening and deterministic installs
Lockfile and dependency hygiene
Vulnerability and package‑health checks
Secrets handling and dev‑environment isolation
Maintainer practices: 2FA, provenance, OIDC, dependency trimming
About Shai-Hulud and supply chain malware
The Shai-Hulud family of attacks marks a turning point for JavaScript developers: npm install is now clearly a remote code execution primitive, not a harmless convenience. In September 2025, the original Shai-Hulud campaign used tampered versions of packages like ngx-bootstrap, ng2-file-upload, and @ctrl/tinycolor to deliver a worm-like payload through npm lifecycle scripts. Malicious postinstall hooks pulled in an obfuscated bundle.js file that ran on developer machines and CI agents, harvesting npm, GitHub, and cloud credentials and exfiltrating them via webhooks and GitHub workflows, with hundreds of packages ultimately implicated.
On November 24, 2025, SHA1-Hulud emerged as a second wave of the same idea, demonstrating how quickly adversaries are iterating. This variant spreads through trojanized npm packages that hide payloads in preinstall scripts. Once the package is installed, the worm attempts to convert the victim into an attacker‑controlled GitHub Actions self‑hosted runner, injects malicious workflows into repositories, and uses them to run arbitrary commands and siphon npm and GitHub secrets. It actively hunts for AWS, Azure, and GCP credentials and, in some cases, even attempts container breakouts, privilege escalation on the host, and destructive “wiper” behavior against a user’s home directory. At the time of writing, more than 600 packages, including popular ones from vendors such as Zapier, PostHog, and Postman, have been identified as part of this campaign, and this number is still growing.
Together, Shai-Hulud and SHA1-Hulud define a clear playbook for modern supply chain malware. They abuse npm’s lifecycle hooks as an execution surface; they weaponize developer workstations and CI/CD infrastructure as hop points; and they treat cloud credentials, tokens, and secrets as the real objective. The details of each incident are still evolving, but the pattern is stable enough that we can extract a set of durable practices that should become part of every JavaScript developer’s muscle memory.
This cheat sheet takes those lessons and turns them into a concrete set of practices that you can apply today: configuring safe‑by‑default package manager settings, hardening against supply chain attacks, enforcing deterministic and secure dependency resolution, wiring in continuous vulnerability and package‑health checks, and mapping each of these controls to npm, pnpm, Bun, and the rest of your toolchain. The goal is not to react to Shai‑Hulud specifically, but to make your day‑to‑day npm usage resilient against the class of attacks it represents.
Quick index
Disable post‑install scripts
Install with cooldown
Harden installs with npq
Prevent lockfile injection
Use deterministic installs (npm ci, etc.)
Avoid blind upgrades
No plaintext secrets in .env
Develop in containers
Enable npm 2FA
Publish with provenance
Publish with OIDC (trusted publishing)
Reduce your dependency tree

1. Disable post‑install scripts
   Your goal is to stop arbitrary code from running during install.
   Risk
   Post‑install (and other lifecycle) scripts are a top supply‑chain attack vector (Shai‑Hulud, Nx, event‑stream). Any dependency or transitive dependency can execute arbitrary code at install time.
   Core npm hardening
   Global: disable all lifecycle scripts (recommended):

# Safe-by-default on your machine

npm config set ignore-scripts true
Per‑install:

# One-off installs without running lifecycle scripts

npm install --ignore-scripts <package-name>
pnpm
From v10+, pnpm disables postinstall scripts by default and supports an allow‑list or re‑enable mechanism. We recommend reviewing pnpm’s supply‑chain security docs for further configuration schematics.
Bun
Bun disables postinstall scripts by default and maintains an internal allow‑list. You can explicitly trust certain dependencies via trustedDependencies in package.json:
{
"trustedDependencies": [
"some-package",
"another-package"
]
}
Run only the scripts you truly need
Use an allow‑list instead of blind trust in package.json:
1# Use LavaMoat's allow-scripts to define where scripts may run
2npm install --save-dev @lavamoat/allow-scripts
3npx allow-scripts
Using LavaMoat’s allow-scripts npm package lets you selectively enable scripts at specific positions in your dependency graph for trusted npm packages that legitimately require the preinstall or postinstall scripts, such as bcrypt, playwright, and others. 2. Install with Cooldown
Your goal is to avoid “brand‑new and malicious” releases and typosquatting traps.
Risk
Attackers exploit SemVer and the “latest” resolution by publishing new versions that are quickly identified and unpublished. If you install instantly, you’re the blast radius.
npm: time‑based installs
Pin to only versions published before a date:

# Install only if published before 2025-01-01

npm install express --before=2025-01-01
Dynamic 7‑day cooldown (BSD-style date example):
npm install express --before="$(date -v -7d)"
Note: This is manual and brittle for automation, but it serves as a useful explicit safety lever.
2.1 pnpm minimumReleaseAge
In pnpm-workspace.yaml:
minimumReleaseAge: 20160 # minutes; here: 2 weeks
pnpm will refuse versions younger than this age, giving the ecosystem time to detect malicious or broken releases.
2.2 Snyk cooldown in automatic PRs
Snyk’s automatic dependency upgrade PRs skip versions younger than ~21 days, reducing:
Upgrades to quickly unpublished buggy versions
Upgrades to packages published from compromised accounts
This is a “cooldown baked into automation” pattern. 3. Harden Installs with npq
Your goal is to avoid installing a package until it passes basic security and sanity checks.
Problem
You run:
npm install some-package
and you don’t know if:
The package is a typo of a popular one
It was published yesterday with no usage
It has known vulnerabilities
It ships nasty pre/post‑install scripts
Strategy: Put npq in front of your installs
npq is a pre‑install security auditor (uses “marshalls” for checks).
Install:
npm install -g npq
Use instead of npm:
npq install express
Make it the default:
alias npm='npq-hero'

# Persist the alias

echo "alias npm='npq-hero'" >> ~/.zshrc # or ~/.bashrc
source ~/.zshrc
When using the npq package, it installs npq and npq-hero; the latter acts as a drop‑in npm wrapper.
What npq checks (“marshalls”)
Vulnerabilities via Snyk CVE DB
New package detection (age < 22 days)
Version maturity (version < 7 days old)
Typosquatting look‑alikes
npm registry signature verification
Build provenance attestation
Pre/post‑install scripts presence
Package health: README, LICENSE, repo URL, downloads
Binary introduction (new CLI tools)
Deprecation signals
Maintainer domain validity / expired domains
pnpm & Bun integration

# One-off

NPQ_PKG_MGR=pnpm npq install fastify
NPQ_PKG_MGR=bun npq install fastify

# Make pnpm go through npq

alias pnpm="NPQ_PKG_MGR=pnpm npq-hero" 4. Prevent npm Lockfile Injection
Your goal is to ensure package-lock.json / yarn.lock can’t silently redirect you to malicious sources.
Risk
A contributor (or attacker via PR) can:
Add a malicious package to the lockfile.
Change the resolved URL to point to a host they control (Git repo, tarball, gist).
Adjust the integrity hash so it looks “valid.”
Then your next install fetches malware even if package.json looks harmless.
Mitigation: lockfile-lint
Install:
npm install --save-dev lockfile-lint
Validate lockfile with allowed hosts and HTTPS:
npx lockfile-lint \
 --path package-lock.json \
 --type npm \
 --allowed-hosts npm yarn \
 --validate-https
Key validation options
Host validation – only npm, yarn, verdaccio, etc.
HTTPS enforcement – reject insecure URL schemes
Scheme validation – whitelist https:, git+https:, git+ssh:
Package name validation – resolved URL matches package name
Integrity validation – enforce secure SHA‑512 integrity hashes
CI/CD integration
Add a pre‑install lockfile lint step:
{
"scripts": {
"lint:lockfile": "lockfile-lint --path package-lock.json --type npm --allowed-hosts npm --validate-https",
"preinstall": "npm run lint:lockfile"
}
}
pnpm & lockfile injection
pnpm’s pnpm-lock.yaml is more resistant because:
It doesn’t rely on arbitrary tarball URLs in the same way
It won’t install a package that’s in the lockfile but not in package.json
The format avoids several injection vectors seen in npm/yarn
Still, treat lockfiles as security‑critical artifacts. 5. Use Deterministic Installs (npm ci)
Your goal is to ensure that builds and prod environments use exact lockfile versions.
Risk
npm install tries to “fix” mismatches between package.json and lockfile, which can:
Pull in versions different from what’s recorded
Break determinism in CI/production
Introduce unexpected, vulnerable, or malicious versions
npm: ci instead of install
Local + CI:

# Deterministic install based on package-lock.json

npm ci
Production-only deps in CI/CD:
npm ci --only=production
Ensure that lockfiles are committed and kept up to date.
Deterministic commands across package managers
Yarn:
yarn install --immutable --immutable-cache
pnpm:
pnpm install --frozen-lockfile
Bun:
bun install --frozen-lockfile
Deno:
deno install --frozen
Lockfiles are part of your supply‑chain contract, not build artifacts to ignore. 6. Avoid Blind npm Package Upgrades
Your goal is to upgrade with review and signals, not “everything to the latest”.
Risk
Avoid blind third-party dependency upgrades like this:
npm update
npx npm-check-updates -u
When you run these commands, whether on CI or on local development environments, you risk the following:
Pull malicious versions released from compromised maintainer accounts
Bring in breaking bugs and unpublished releases
Trigger dependency confusion or namespace hijacking attacks
Better patterns

1. Interactive upgrades:
   npx npm-check-updates --interactive
2. Review each dependency before bumping.
3. Security‑aware bots:
   Snyk automatic upgrade PRs
   GitHub Dependabot PRs
4. These create reviewable PRs with context (changelogs, CVEs) instead of silently changing your lockfile.
5. No Plaintext Secrets in .env Files
   Your goal is to stop secrets from being trivially exfiltrated from your dev environment.
   Risk
   Plaintext .env files & environment variables:
   Are easy targets for malicious packages or dev malware.
   Often end up in logs, crash dumps, terminal history, etc.
   Are read via process.env or direct file reads in supply‑chain attacks.
   Here’s an anti‑pattern:
   DATABASE_PASSWORD=my-secret-password
   API_KEY=sk-1234567890abcdef
   Pattern: Secret references + just‑in‑time injection
   Step 1 – Put references (not values) in .env:
   DATABASE_PASSWORD=op://vault/database/password
   API_KEY=infisical://project/env/api-key
   Step 2 – Use the secret manager CLI at runtime. Using 1Password CLI as an example:

# Run app with secrets injected into process.env

op run -- npm start

# More explicit example with env-file

op run --env-file="./.env" -- node --env-file="./.env" server.js
Other options: Infisical CLI, cloud secret managers, etc. The core idea: env var contains a handle, not the secret. 8. Work in Dev Containers
Your goal is to sandbox your development environment so npm malware doesn’t own your host.
Risk
Running npm install on your host means:
Malicious packages can read files from your other repos
They can scan SSH keys, browser profiles, AI/agent tokens, etc.
They share the OS namespace with everything else you do
Dev container pattern
Use VS Code Dev Containers (or similar) to isolate, such as the following DevContainer configuration file .devcontainer/devcontainer.json:
{
"name": "Node.js Dev Container",
"image": "mcr.microsoft.com/devcontainers/javascript-node:18",
"features": {
"ghcr.io/devcontainers/features/1password:1": {}
},
"postCreateCommand": "npm ci"
}
Then:
Open the folder in VS Code
“Reopen in Container”
All installs and runs happen inside the container.
Hardening the dev container
Add Docker security options and secure Node flags:
"runArgs": [
"--security-opt=no-new-privileges:true",
"--cap-drop=ALL",
"--cap-add=CHOWN",
"--cap-add=SETUID",
"--cap-add=SETGID"
],
"containerEnv": {
"NODE_OPTIONS": "--disable-proto=delete"
}
For even more control, use a custom Dockerfile with minimal base images, a non‑root user, and a hardened runtime. 9. Enable 2FA for npm Accounts
Your goal is to prevent account takeover from turning into malicious versions being published by compromised accounts.
Risk
Incidents like eslint-scope showed that once an attacker obtains credentials, they can publish backdoored versions to millions of users. Password‑only auth is not enough.
Commands
2FA for login + publishing + profile changes:
npm profile enable-2fa auth-and-writes
2FA for login/profile changes only (less strict):
npm profile enable-2fa auth-only
Apply auth‑and‑writes to all accounts that can publish or add maintainers.
Configure trusted OIDC publishing
In addition to configuring your npm account with proper password controls such as 2FA and Passkey, you should also use the new Trusted OIDC Publishing method as the only way to publish new npm packages, directly attributing to your GitHub repository and specific workflows. See the dedicated section on this further on. 10. Publish with Provenance Attestations
Your goal is to allow consumers to verify where/how your package was manufactured.
Problem
Without provenance, consumers can’t easily tell:
Was this tarball built from GitHub source A or from a rogue machine?
Did a compromised CI pipeline inject code?
Solution: npm publish --provenance
In GitHub Actions:
permissions:
id-token: write

steps:

- run: npm publish --provenance
  Requirements:
  npm CLI 9.5.0+
  GitHub Actions (or GitLab CI/CD) with cloud‑hosted runners and OIDC support
  This produces cryptographically verifiable build metadata aligned with emerging supply‑chain standards (e.g., OpenSSF).

11. Publish with OIDC (trusted publishing)
    Your goal is to eliminate long‑lived npm tokens from CI/CD.
    Risk
    Long‑lived tokens:
    Get accidentally logged or committed
    Stay valid after leaks
    Provide broad, long‑term access to your org and packages
    Trusted publishing pattern
    Configure the package as a trusted publisher on npmjs.com (GitHub or GitLab).
    Use OIDC in your workflow:
    GitHub Actions example:
    permissions:
    id-token: write

steps:

- run: npm publish
  No NPM_TOKEN is stored anywhere. npm verifies the OIDC token from your CI and only allows publishing from your approved workflows. Provenance attestations are generated automatically.

12. Reduce Your Package Dependency Tree
    Your goal is to have a smaller dependency graph, which in turn creates a smaller attack surface that can put you at risk.
    Risk
    Every dependency:
    Brings its own transitive dependencies
    Inherits maintainers, accounts, and their potential compromises
    Expands your vulnerability and license footprint
    Strategy
    Prefer zero‑ or low‑dependency design. Use modern JavaScript instead of pulling in a utility library for trivial tasks.
    Examples:
    // Instead of lodash uniq
    const unique = [...new Set(array)];

// Instead of axios for simple HTTP GET
const response = await fetch(url);

// Instead of utility libs for trivial checks
const isEmpty = obj => Object.keys(obj).length === 0;
Before adding a dependency, ask yourself (or your team):
Is this non‑trivial functionality?
Does it justify the security and maintenance cost?
Is there a standard API for this now?
The outlook for developer security and supply chain malware
This guide shares some npm security best practices that we first published in 2019, and further strengthens and extends them to incorporate modern practices and lessons learned from the supply chain attacks we’ve witnessed in 2025.
First, developers need to treat the package manager as an untrusted execution engine and configure it with safe‑by‑default options. That means disabling lifecycle scripts wherever possible, relying on explicit allow‑lists when scripts are truly needed, and giving yourself mechanisms like cooldown windows and pre‑install audits to make “installing a new package” a deliberate act instead of a reflex. Those controls must extend beyond npm itself to pnpm, Bun, and other modern package managers, so that your defaults are consistent across all tooling in the workspace.
Second, dependency resolution has to be deterministic and defensible. The Shai‑Hulud campaigns exploited the fact that a single unnoticed version bump or lockfile modification could bring a malicious tarball into thousands of projects. In response, teams should anchor their workflows around strict, frozen lockfiles, enforce this behavior in CI, and guard those lockfiles with tools that validate the origin of your packages. Deterministic installs are not only about reproducibility; they’re about being able to answer the question “what code did we run, and where did it come from?” when an incident hits.
Third, vulnerabilities and health signals for dependencies must be treated as a continuous data stream, not an occasional report. Incidents like these move faster than traditional CVE publication, so your defenses must combine vulnerability databases, malware advisories, provenance attestations, package age and popularity signals, and automated upgrade policies with built-in cooldown periods. Security gates at installation time, automated PRs that avoid very new releases, and tooling that understands the difference between a minor bug fix and an untrusted, never-before-seen package version are essential pieces of that picture.
Finally, effective npm security is not just about installing dependencies. It depends on how you structure your local development environment, how you manage secrets, and how you publish and maintain your own packages. Working inside hardened development containers limits the blast radius when a malicious package is detected. I recommend you should not use plaintext secrets in your environment variables and so moving away from plaintext .env files toward just‑in‑time secret injection reduces what an attacker can steal, even if they do manage to execute code. Enabling 2FA, trusted publishing with OIDC, and provenance attestations for your own npm packages raises the bar for anyone trying to hijack your identity in the ecosystem.
Stay secure with Snyk
Snyk monitors the Shai-Hulud situation closely and ships updates regularly through the platform. As of yesterday (November 24th) we have already tracked more than 800 malicious packages.
We’ve outlined several resources below to help you get more in control on the current incident and prepare for the next time it happens.
Shai-Hulud list of compromised packages
Snyk maintains a public web page list of Shai-Hulud malicious packages affiliated with malware campaign:
This page provides the complete list of npm packages impacted by the SHA1-Hulud npm supply chain incident on Nov 2025
Snyk Zero-Day reports
When you connect your repositories to Snyk or monitor them in any other way, you now have established an inventory and doing so, you can easily track various aspects of your dependencies such as auditing across your entire R&D organization whether you are impacted by the Shai-Hulud malware.
To understand whether you are impacted by this event, visit Reports > Featured Zero-Day Report. To learn more about this feature, read our User Docs.
The following screenshots demonstrates how to find it in the Snyk UI (showing the previous Shai-Hulud npm supply chain attack from September 2025). The new report is named SHA1-Hulud npm Supply Chain Attack - Nov 2025:
Snyk Zery-Day report Shai-Hulud npm supply chain attack from September 2025
Monitor your dependencies with Snyk
Reliance on open-source software libraries requires that you continuously monitor and stay up-to-date with security updates, whether they are CVE vulnerabilities or malware campaigns for your entire dependency tree, direct or indirect, across your entire organization.
With Snyk, you can connect your Git repositores and take proactive control on open source risk for JavaScript projects with Snyk Open Source as an SCA tool. You can, and should also maintain an SBOM which Snyk provides out of the box for you.
We also recommend you prepare for tomorrow’s Zero-Day vulnerabilities, today.
Prepare for zero-day vulnerabilities with Snyk
Learn how Snyk can enable your developers to remediate zero-day vulnerabilities faster to reduce exposure and risk.
PLATFORM

Snyk AI Security Platform
Snyk AI Workflows
DeepCode AI
Integrations
OUR RESOURCES

Resource Library
Blog
Snyk’s Podcasts
KNOWLEDGE & DOCS

Snyk Labs
Snyk Learn
Snyk User Docs
Snyk Support
Snyk Vuln Database
Snyk Updates
Snyk Trust Center
COMPANY & COMMUNITY

About Snyk
Contact Us
Book A Demo
Careers
Events & Webinars
Ambassadors
WHY SNYK

Snyk vs GitHub Advanced Security
Snyk vs Veracode
Snyk vs Checkmarx
Snyk vs Black Duck
Snyk vs Wiz
Patched & Dispatched
Your monthly roundup of Snyk content – the latest insights patched in, dispatched straight to your inbox. No fluff. Just the good stuff.
© 2025 Snyk Limited
Registered in England and Wales
Legal terms
Privacy Notice
Terms of use
California residents: do not sell my information
