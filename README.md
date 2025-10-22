## Who:
Developers or DevOps engineers managing Terraform deployments.

## What:
Create a CLI tool named tteraform that simplifies working with Terraform projects.
The tool provides commands such as:

```bash
tterraform config 
```
configure provider credentials (AWS, Azure, etc.)

```bash
tterraform scan 
```
scan for missing parameter store keys or configuration issues

```bash
tterraform add 
```

add or fix missing keys interactively or via flags

## Why:
To add parameter directly from terminal and not from SSM web ui.