---
title: 'Reproducibility Now!'
date: 2030-01-01
description: 'A bottom-up stack—Nix, uv, and friends—so analyses run the same on every machine.'
tags:
  - reproducibility
  - nix
  - uv
  - tooling
---

If you're the type that is inclined to download someone's code and data you've almost certainly had trouble reproducing someone's results; even with their data and code handy. You can almost smell it coming when you open their OSF to find it's just a bunch of R scripts and .csv files loosely organized into ever-nested folders. Perhaps you open the first file and find something like this:

<details markdown="1">
<summary>The kind of R script that ruins your afternoon</summary>

```r
library(tidyverse)
library(mycustompackage)
library(rio)
df <- read.csv("~/joseph/projects/2026/some_experiment/data/dataset_43413.csv")
```

</details>

Questions you find yourself asking:

1. What operating system?
2. What version of R?
3. What version of these libraries?
4. What is that custom library???? where is it???
5. How many .csv files do I have to rewrite the paths for in this project?

If you're really unlucky, you hit a dependency hell without answers to 1-4; even if you manage to find that custom library. As installed on your machine, the libraries themselves might conflict. Alternatively, and much more frustratingly, they might lead to conflict between system-level requirements and your specific OS. Even if you manage to get the code to run, and spend time fixing all of those paths, your results might only approximately match or might not match at all. Nopw you have to decide whether to email the authors...

This blog post is for anyone who wants to ensure they never put any other person in this position; and also would like their code to run the same every time. By the end, you'll be able to run an analysis with a single command that is identical each and every time on any machine.

## Contents

- [Prerequisites](#prerequisites)
- [A solved problem, from the bottom up.](#a-solved-problem-from-the-bottom-up)
- [Part 1: Nix](#part-1-nix)
  - [Barebones](#barebones)
- [Part 2: Managing our analysis libraries/packages](#part-2-managing-our-analysis-librariespackages)
  - [Managing dependencies in R](#managing-dependencies-in-r)
  - [Managing dependencies in Python](#managing-dependencies-in-python)
- [Part 3: Everyone needs a little structure](#part-3-everyone-needs-a-little-structure)
  - [Directory Structure](#directory-structure)

## Prerequisites

1. **Terminal/Command Line:** If you want to have truly reproducible code you'll need to get comfortable using the terminal or command line on your computer. Without it, we can't reliably convey exactly what we did to others; which series of mouse clicks on which version of which operating system, etc... There are so many videos, tutorials and guides out there for your unique operating system (Windows, OS X, Linux, etc..) that it's hard to link to just one. Learn the basics of how to navigate your files, and enter in simple commands.

2. **Git/Github**: Git is software for [version control](https://git-scm.com/), and you [can learn a lot more about it here](https://git-scm.com/docs/gittutorial). In its simplest form, it saves your code and a record stamped each time you save (called "making a commit"). It can also handle the directory structure your project has, save data (and a record of any changes), and do a whole hell of a lot more.

Github is a website that manages and hosts git code repositgories. Using github might be intimidating but fortunately they have a [great tutorial](https://docs.github.com/en/get-started/start-your-journey/what-is-github), and even a [desktop app](https://desktop.github.com/download/). Github can even handle storing your data; up to fairly large files through its LFS if you're willing to pay a little bit. For most projects, you can get away with the free tier just fine.

## A solved problem, from the bottom up.

If we want our code to be reproducible it needs to be a problem we solve from the bottom up. There are many ways to do this but here's the stack I've been into from the lowest level up.

1. [Nix](https://nixos.org/)
2. [Python](https://www.python.org/downloads/release/python-3120/) with [uv](https://docs.astral.sh/uv/) (Alternatively R with [Renv](https://rstudio.github.io/renv/))
3. [just](https://github.com/casey/just) (Optional, nice to have)

It's that simple. I also use VS Code and Jupyter notebooks for most of my softfware development, but it's entirely fine if you use R Studio or whatever it is you learned on. I've put this all togetheinto a repository, which you're welcome to check out:

```bash
git clone https://github.com/josephbb/ReproducibilityNow.git
cd ReproducibilityNow
```

## Part 1: Nix

### Barebones

Nix is likely the least famliar tool of the ones above, but in my opinion it's the most important and powerful one in our arsenal. What it lets us do is write a simple file, like the one below, that defines our system configuration and the packages we want to have installed.

<details markdown="1">
<summary>Barebones <code>flake.nix</code></summary>

```nix
{
  description = "Nix shell with R and Python";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";

  outputs =
    { nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          R
          python312
        ];
      };
    };
}
```

</details>

With [Nix installed](https://nixos.org/download/) we can go into our terminal and type the following:

```bash
nix develop
```

This builds our little machine and brings us into it in the command line, which we can confirm by trying out some commands like:

```bash
which R
which python3.12
R --version
python3.12 --version
```

Each of these should echo back to us that the version we're using is within our little nix computer we've constructed using a file. If you want to give this a try on the barebones flake, you can checkout this commit:

```bash
git checkout c722774f1e92cbe6b8bf1cf93fe44d4c5c9683b0
```

## Part 2: Managing our analysis libraries/packages

We'll come back to nix in a little bit, but we need more than just bare Python and R to analyze data. We want things like [tidyverse](https://www.tidyverse.org/) or the [SciPy stack](https://scipy.org/). If you've not thought a lot about reproducibility, odds are good you install packages on your local machine and just run code making updates whenever needed or something breaks. Your machine winds up with its own unique set of packages, which can be difficult to communicate to whomever is reproducing your results. Enter package management tools like [uv](https://docs.astral.sh/uv/) and [renv](https://rstudio.github.io/renv/).

### Managing dependencies in R 
In addition to our `flake.nix`, we'll need files that define which packages we're using and eventually pin down the specific versions we used when we last ran our code. For Renv, we can have a `DESCRIPTION` file like the following. If the re are additional packages you need, you can just list them below the imports.  

```r
Package: reproducibility.now
Type: Project
Title: Reproduciblilty Now
Version: 0.1.0
Imports:
    tidyverse,
    data.table,
    broom,
    janitor,
    here
```

### Managing dependencies in Python 

For python, it's much the same story with [uv](https://docs.astral.sh/uv/). We can define a `pyproject.toml` file. As with Renv, we just have to list which packages we'll wind up wanting when we run our analysis. 

```toml
[project]
name = "reproducibility-now"
version = "0.1.0"
requires-python = ">=3.12,<3.13"
# Add/remove Python packages here, then: uv lock && uv sync
dependencies = [
  "numpy",
  "pandas",
  "scipy",
  "matplotlib",
  "seaborn",
  "statsmodels",
  "pymc",
  "arviz",
]

[tool.uv]
package = false
```

## Part 3: Everyone needs a little structure

Our `flake.nix` needs a little more juice in it, to ensure that it has the linux has the tools necessary to build the various Python and R packages. I've taken the liberty of incorporating those into the git repo version of `flake.nix` which should work for most of your analysis needs. If you find it doesn't, LLMs tend to be pretty god at modifying flake.nix to sort out OS-level dependencies for packages in R/Python. 


### Directory Structure


```text
ReproducibilityNow/
├── analysis_config.yaml
├── analysis/
│   └── analysis.ipynb
├── data/
│   ├── raw/
│   └── generated/
└── output/
    ├── figures/
    └── tables/
```

This is a somewhat opinionated blog in general, and this post is no exception. I think it's important to have your files organized coherently and so our directory has a little bit of structure. While projects vary widely; they tend to have almost all have data, analysis code, and output. 

Data can either be *raw*, in the sense that it has not been manipulated by you at all or what I call *generated*, in that some code has converted the raw data into another form. I like to keep thes two things separated by their own folders. The file you downloaded from Qualtrics? Raw. The long-format version with column names that actually make sense: generated. 

Then we have output; here I think figures and tables are two big categories that most papers tend to have so I separate them into their own little folders. I also like to store a little file of all the numbers that are going to go into my paper somewhere; ideally putting them right into the LaTeX but that's for a later blog post. For now, it's just going to be called 'results.json' 

The final folder is analysis, and this is where things get a little flexible. For me, I like to have a src folder, that I treat as a little anlysis-specifci python package. Inside are utlities, plotting functions, and any other reusable code or things I don't want cluttering my main analysis notebook. I've included a barebones version here. I also like to have a a config file where I can put any parameters that pertain to my analysis; any number or input that I have to choose and want to keep track of, something like this: 


```yaml
# Shared analysis settings (read by both R and Python)
paths:
  raw: data/raw
  generated: data/generated
  figures: output/figures
  tables: output/tables
  dataset_one: data/raw/dataset_one.csv

seed: 42

# Language-specific settings (optional)
r:
  chains: 4
  iter: 2000

python:
  draws: 1000
  tune: 1000
```

You can get as expansive or contractive as you want, including things like the palette you'll use, figure size and output options, or whatever you can dream up. Then, when you get hit with a request to change something across the entire anlysis you don't wind up having to scroll through all of your code and find everywhere that you set draws=1000 or whatnot. 

You can also set paths. Here, I've set my opinionated paths. Rather than manually encode where a given folder or file is located, we'll store it all here and pull it open as variables in our analysis. I'll have examples for by R and Python. 
