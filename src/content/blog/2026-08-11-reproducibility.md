---
title: 'Reproducibility Now!'
date: 2026-08-11
description: 'A bottom-up stack with Nix, uv, and renv'
tags:
  - reproducibility
  - nix
  - uv
  - tooling
---

With the [demise of OSF](https://www.cos.io/osf-changes) as a place to dump your code and data for posterity's sake, I've finally found the motivation to write a blog post detailing my (evolving) reproducibility workflow. This came about after quite a bit of frustration downloading code and data, opening the first file, and finding something like this:

<details markdown="1">
<summary>The kind of R script that ruins your afternoon</summary>

```r
library(tidyverse)
library(mycustompackage)
library(rio)
df <- read.csv("~/joseph/projects/2026/some_experiment/data/dataset_43413.csv")
```

</details>

Questions I found myself asking:

1. What operating system?
2. What version of R?
3. What version of these libraries?
4. What is that custom library???? where is it???
5. How many .csv files do I have to rewrite the paths for in this project?

On bad days, I'd hit a dependency hell, even if I managed to track down that custom library. You can't install library A without library Z, but Z conflicts with B and you need B... Alternatively, and much more frustratingly, the code might produce conflicts between system-level requirements and my specific OS (Ubuntu, OS X). Even if I manage to get the code to run, and spend time fixing all of those paths, my results might only approximately match or might not match at all. Now I have to decide whether to email the authors...

It doesn't have to be like this... Reproducibility now! 

**tl;dr**
If you want to skip reading this post and just play around with my barebones, evolving, imperfect, and partially LLM-coded reproducibility repo: 

```bash
git clone https://github.com/josephbb/ReproducibilityNow
```

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
  - [Data](#data)
  - [Analysis](#analysis)
  - [Output](#output)
- [Part 4: Extending your analysis beyond the bullshit I provided](#part-4-extending-your-analysis-beyond-the-bullshit-i-provided)
  - [Python: The easy way](#python-the-easy-way)
  - [Why is everything a little harder with R?](#why-is-everything-a-little-harder-with-r)
- [Part 5: Producing and Re-producing](#part-5-producing-and-re-producing)
  - [The Payoff](#the-payoff)
- [Coda: Just for single-line reproducibility](#coda-just-for-single-line-reproducibility)
- [Coda 2: Preregistration](#coda-2-preregistration)

## Prerequisites

1. **Terminal / command line:** Truly reproducible workflows require comfort with the command line, there's just no way around it. You don't need to be a wizard; just comfortable navigating directories and running simple commands.

2. **Git / GitHub:** Git is [version control](https://git-scm.com/) ([tutorial](https://git-scm.com/docs/gittutorial)). [GitHub](https://docs.github.com/en/get-started/start-your-journey/what-is-github) hosts repositories ([desktop app](https://desktop.github.com/download/) if the command line interface (CLI) feels intimidating).

## A solved problem, from the bottom up.

If we want our code to be reproducible it needs to be a problem we solve from the bottom up. There are many ways to do this but here's the stack I've been into from the lowest level up.

1. [Nix](https://nixos.org/)
2. [Python](https://www.python.org/downloads/release/python-3120/) with [uv](https://docs.astral.sh/uv/) (Alternatively R with [renv](https://rstudio.github.io/renv/))
3. [just](https://github.com/casey/just) (Optional, nice to have)

It's that simple. I also use VS Code and Jupyter notebooks for most of my software development, but it's entirely fine if you use RStudio or whatever it is you learned on. I've put this all together into a repository, which you're welcome to check out:

```bash
git clone https://github.com/josephbb/ReproducibilityNow.git
cd ReproducibilityNow
```

## Part 1: Nix
### Barebones

Nix is likely the least familiar tool of the ones above, it's certainly the most powerful... my entire computer is set up using Nix and I can migrate everything I use and do to a new machine in minutes. The cool thing is that all of this firepower comes from writing a simple file, and we'll leverage that in our workflow. 

This file, `flake.nix`, defines the tools we want in a development shell (e.g., compilers, R, Python, system libraries).  Anyone who opens the project gets the same *explicitly declared* toolchain. This solves a host of problems that creep in when our code and analysis are depending on our local machine's toolchain; various different versions of *whatever*. R and Python code routinely call/rely on system-level installs and if those differ, results can differ. 

Nix isn't a proper container service like [Docker](https://kordinglab.com/2022/10/28/LabTeaching-Docker-for-Science.html), and instead pins packages **per system** (e.g. `x86_64-linux`, `aarch64-darwin`). You don't get one blob that runs on every OS, as you might if you went to something fully containerized with docker. For some scientific workflows, that's the right call but Nix is incredibly lightweight and so I've been leaning towards it more and more.  

In any event, a single file gives us a recipe (`flake.nix` + committed `flake.lock`) that can build an approximately matching environment on each machine. It might look something like this to install R and Python: 

<details markdown="1">
<summary>Barebones <code>flake.nix</code> (Linux + macOS)</summary>

```nix
{
  description = "Nix shell with R and Python";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin" # Apple Silicon
        "x86_64-darwin"  # Intel Mac
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              R
              python312
            ];
          };
        }
      );
    };
}
```

</details>

With [Nix installed](https://nixos.org/download/), go into the project directory and run:

```bash
nix develop
```

Nix as configured in the repository I've included picks the shell for *your* machine (at least if it's apple or linux). It builds (or downloads) the packages for that system and drops you into a shell where they're on your `PATH`. Confirm with:

```bash
which R
which python3.12
R --version
python3.12 --version
```

Here's where that file `flake.lock` gets generated, which you'll want to commit to your repo when you start creating reproducible code. It pins the exact nixpkgs revision (and package versions) so everyone gets the same toolchain for their OS. Similarly, R and Python *packages* will live in their own `renv.lock` / `uv.lock`. It's package management and locking all the way down. 

Our `flake.nix` needs a little more juice in it compared to whats above, to ensure that it has the tools necessary to build the various Python and R packages. The version in the git repo already includes that and should work for most analysis needs. If you find it doesn't, LLMs tend to be pretty good at modifying flake.nix to sort out OS-level dependencies for packages in R/Python. LLMs are bad at lots of things in science, but they're very good at things like nix flakes and bash scripts for simple tasks. 

### Windows Users
I don't have a windows machine and haven't for the better part of a decade. From what I understand you would just do [something like this](https://nix-community.github.io/NixOS-WSL/). If anyone tries this and gets it working lmk. 

## Part 2: Managing our analysis libraries/packages

Nix alone isn't enough. We need more than just bare R and Python to analyze data, unless you're a psychopath who writes all of their own packages for everything. We want things like [tidyverse](https://www.tidyverse.org/) or the [SciPy stack](https://scipy.org/). If you've not thought a lot about reproducibility, odds are good you install packages on your local machine and just run code making updates whenever needed or something breaks. Your machine winds up with its own unique set of packages, which can be difficult to communicate to whomever is reproducing your results. That's what [uv](https://docs.astral.sh/uv/) and [renv](https://rstudio.github.io/renv/) are for, and they work like Nix but for managing our analysis language packages. 


### Managing dependencies in R 
In addition to our `flake.nix`, we'll need files that define which packages we're using and eventually pin down the specific versions we used when we last ran our code. For renv, we can have a `DESCRIPTION` file like the following. If there are additional packages you need, you can just list them below the imports.  

```text
Package: reproducibility.now
Type: Project
Title: Reproducibility Now
Version: 0.1.0
Imports:
    tidyverse,
    data.table,
    broom,
    janitor,
    here
```

You might find yourself needing additional libraries, and you can simply add them to the list of imports in `DESCRIPTION`. Once you have, update the lockfile from inside the Nix shell:

```bash
nix develop #if you haven't already
Rscript -e 'renv::install(); renv::snapshot()'
```

`renv::install()` pulls in whatever you listed; `renv::snapshot()` writes the exact versions into `renv.lock`. Commit that lockfile. Anyone else (or you, on another machine) gets the same R packages with:

```bash
Rscript -e 'renv::restore()'
```

### Managing dependencies in Python 

For Python, it's much the same story with [uv](https://docs.astral.sh/uv/). We can define a `pyproject.toml` file. As with renv, we just have to list which packages we'll wind up wanting when we run our analysis. 

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
Here too, you can add dependencies by simply appending them to the list above. Once you have, enter the Nix shell (by typing `nix develop` in the terminal) and run:

```bash
nix develop #if you haven't already
uv lock && uv sync
```

`uv lock` refreshes `uv.lock` with the exact versions that satisfy your list; `uv sync` installs them into the project virtualenv. Commit the lockfile to git. Anyone else gets the same Python packages with:

```bash
uv sync
```

### Nix-Free
You can, in theory, skip the whole nix part and just adapt your workflow to use renv/uv. It'll be a huge step up from most code... What you'll lose is some of the dependency management of lower-level things. I find it really helpful; you might not need it for ANOVA on a .csv. 

## Part 3: Everyone needs a little structure

### Directory Structure
Organizing our projects is a perpetual challenge, and there's often no right answer and plenty of wrong ones. I've set up the default repository in a way that I feel works well for most projects. Here's the general idea: 

```text
ReproducibilityNow/
├── flakes and lockfiles [not listed individually here]
├── analysis/
│   ├── analysis_config.yaml
│   ├── analysis.ipynb
│   ├── analysis.py
│   ├── analysis.R
│   ├── analysis.Rmd
│   └── src/
│       └── util.py
├── data/
│   ├── generated/
│   └── raw/
│       └── dataset_one.csv
├── output/
│   ├── figures/
│   ├── tables/
│   └── results.json
└── scripts/
```

Most scientific projects for which we'd worry about reproducibility have data and files that turn that data into output: statistics, tables, figures and such. The structure above separates those three concerns: Data, Analysis, and Output. 

### Data
I like further delineating which data files are *raw* and which were *generated* or produced by some analysis script. For example, whatever you download from Qualtrics you can dump into raw. Whatever it gets turned into for analysis (e.g. wide to long, column renames) can go into generated. This is just a starting point and feel free to add subdirectories if it makes sense; perhaps you collected various waves of data or have data of very different types.

One cool trick: put `data/raw/*` in a `.gitignore` at the repo root (and keep an empty `data/raw/.gitkeep` so the folder still exists). That helps when the raw files aren't something you want public, such as individually identifiable survey responses. The template repository has these commented out, so just uncomment them if you'd like to avoid committing raw. 

Another useful trick: symlink so data that lives in a backed-up location (Dropbox, iCloud, Proton Drive, an external drive) still appears under `data/` in the project. From the repo root:

```bash
ln -s ~/Dropbox/MyProject/Data/Raw ./data/raw
```

That makes `./data/raw` point at the Dropbox folder. Paths in your config and scripts stay project-relative; only the symlink cares where the bytes actually live. 

### Analysis
I've included a few different types of files for analysis, because I know you freaks have your own preferences for R Markdown, Jupyter notebooks, or just plain old files. Delete what you won't use. For Python users, there's `src` which will let you encapsulate reused functions and code to keep things [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

However, I think the most under-utilized thing is a config file of some sort; I usually use [.toml](https://toml.io/en/) but here have included a [.yaml](https://yaml.org/) because it plays a little nicer with R. Below is what it contains (as an example). 

```yaml
analysis:
  python: ["analysis.ipynb", "analysis.py"]
  r: ["analysis.R"]
  rmarkdown: ["analysis.Rmd"]

paths:
  raw: data/raw
  generated: data/generated
  figures: output/figures
  tables: output/tables
  dataset_one: data/raw/dataset_one.csv
  results: output/results.json

seed: 42

# Palette 
palette:
  name: hinoki_forest
  colors:
    mist_sky: "#E8F1EC"
    hinoki_bark: "#CDBB9C"
    moss_light: "#B7C9A0"
    cedar_needle: "#7E9A72"
    forest_shade: "#4E6B53"
    deep_grove: "#2F4A3C"
    stone_path: "#8F8A7A"
    ember_clay: "#A66A53"

# Language-specific settings (optional)
r:
  chains: 4
  iter: 2000

python:
  draws: 1000
  tune: 1000

```

Put as much or as little in here as you want: the palette, figure sizes, output options, whatever. Then, when you get hit with a request to change something across the entire analysis, such as a reviewer-offending but gorgeous palette, you can do so with ease. You can also set paths, such as where data will live that make life easier for whoever comes along later. If you're into model comparison or multi-verse analysis; you can even use the config to scope out what might live in that multiverse. 

### Output
The figures and tables directories in output are pretty straightforward places to store figures and tables. The final quirk is `results.json`. I find myself creating a file like this to store all of the numbers associated with my analysis: the effect sizes and credible regions, the sample size. In a later post I'll show how I template those into LaTeX, but the goal is that I never again have to type a number into a paper I'm writing. It's too error-prone a process, especially when you identify a bug or have some other thing happen that completely changes everything in the paper. Much nicer to simply rerun the analysis, recompile the manuscript, and rest assured that all of the numbers in it are correct. 

## Part 4: Extending your analysis beyond the bullshit I provided 

When you go to work up your analysis, how you proceed will depend somewhat on whether you're working in R or Python. I'm 98% a Python person, and I do my work in VS Code, so I tend to just install a Jupyter kernel and call it a day:

### Python: The easy way
```bash
nix develop
uv sync
./scripts/register-jupyter-kernel.sh
```

Then refresh your kernel list and select **Python (ReproducibilityNow)** (or whichever display name matches the repo). The register script wires Jupyter through a small wrapper so the kernel still finds Nix's libraries even when the editor starts it outside `nix develop`.

Alternatively, from inside the Nix shell you can spool up an in-browser notebook:

```bash
uv sync
.venv/bin/jupyter lab
```
### Why is everything a little harder with R?
For R, things get a little more complicated (or they seemed so to me). Ideally you'd open an RStudio that Nix itself installed—but Nix's Electron-based RStudio packaging is a mess. The better approach is: keep your normal, system-installed RStudio as the GUI, and point it at the Nix shell's R.

On Linux, the template flake provides a small `rstudio` helper that sets `RSTUDIO_WHICH_R` and launches `/usr/bin/rstudio`:

```bash
nix develop
Rscript -e 'renv::restore()'
rstudio
```

On macOS, same idea from inside the Nix shell. Restore first and wait for it to finish (first time can take a while), quit RStudio if it's already open, then launch a fresh instance pointed at Nix's `R`:

```bash
nix develop
Rscript -e 'renv::restore()'
open -na RStudio --env RSTUDIO_WHICH_R="$(which R)"
```

Alternatively, set the R version once under **Tools → Global Options → General** to the path `which R` prints. Either way: system RStudio for the IDE, Nix + `renv` for the engine.

Once you're in, check that `R.home()` looks like a Nix store path, then open `analysis/analysis.R` or `analysis/analysis.Rmd` and work as usual.

If you're an R user and have a better way—or try this and it goes to shit—let me know. I got it working on Ubuntu; macOS still has some rough edges with Stan and RStudio that I haven't sorted out.

## Part 5: Producing and Re-producing

Once you've developed your analysis, you can regenerate everything from the repo root inside `nix develop` with a single line per entrypoint. Make sure you're in the Nix shell:

```bash
nix develop # if you haven't already
```

From there, what happens next depends on where your code lives. For a Python notebook:

```bash
uv run jupyter nbconvert --to notebook --execute analysis/analysis.ipynb --inplace
```

Python script:

```bash
uv run python analysis/analysis.py
```

R script or R Markdown:

```bash
Rscript analysis/analysis.R
Rscript -e 'rmarkdown::render("analysis/analysis.Rmd", output_dir = "output")'
```

### The Payoff

This has been a long blog post, and if you adopt the workflow you'll scratch your head adapting it to your own projects. The upside is that someone else can reproduce the analysis on their machine with something like:

```bash
git clone https://github.com/josephbb/ReproducibilityNow.git
cd ReproducibilityNow
nix develop
uv sync
uv run python analysis/analysis.py
```

Alternatively you can replace those final lines with whichever corresponds to your analysis file-type of choice. Either way; this reproduces your results and handles all of those issues with package dependencies. Your parameters are all centrally located in a config, your paths relative, and your files easy to find. Computational reproducibility becomes a couple of lines in a terminal (fewer still with a justfile, see below) 


## Coda: Just for single-line reproducibility
If we want truly one-line reproducibility we can use a tool called [just](https://github.com/casey/just), which is a great way to simplify frequently run commands. I've included a little example `justfile` that assumes you've only got one of the analysis files (and have removed the rest) and reproduces it with a single line. Assuming you've cloned or downloaded the repo:

```bash
nix develop -c just reproduce
```

This will run the analysis and produce all relevant figures and results; reproducibility in a single line. When I get the time, I'll try and blog post (with template repo) for single line reproducing a paper and SI. 


## Coda 2: Preregistration

This setup also works for people who love preregistration in its various forms:

1. Set up your repo.
   - In the README, write everything you might put in a preregistration.
   - Write your code, analyze simulated data, produce fake results.
   - Commit once you're satisfied. 
2. Freeze the repo as-is with a git bundle:

```bash
git bundle create my-project-history.bundle --all
```

3. Store that bundle somewhere agreeable.
4. Collect data.
5. Run the analysis with one line again, write up the paper.

What makes this very cool is that as you go and analyze the real data, you can deviate as needed. Update it in the analysis plan in the `README.md`, but it will also show up in the code. A `git diff` can reveal changes between when you froze things (your prereg) and your final analysis. You have a full and complete record of every single deviation in your analysis plan. This might have helped some folks ([The Preregistration Revelation](/blog/2024-09-24-protzko/)).
