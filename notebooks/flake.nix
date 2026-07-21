{
  description = "Personal site notebooks — Nix + uv + Jupyter (PyMC-ready)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        python = pkgs.python312;
        uvPython = "${python}/bin/python3.12";
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            python
            uv
            just
            pandoc
            quarto
            stdenv.cc
            zlib
          ];

          shellHook = ''
            export UV_PYTHON="${uvPython}"
            export UV_PYTHON_DOWNLOADS=never
            export UV_PROJECT="$PWD"
            export PATH="$PWD/.venv/bin:$PATH"
            if [ -n "''${LD_LIBRARY_PATH:-}" ]; then
              export LD_LIBRARY_PATH="${pkgs.zlib.out}/lib:${pkgs.stdenv.cc.cc.lib}/lib:''${LD_LIBRARY_PATH}"
            else
              export LD_LIBRARY_PATH="${pkgs.zlib.out}/lib:${pkgs.stdenv.cc.cc.lib}/lib"
            fi

            if [ ! -d .venv ] || ! .venv/bin/python -c "import ipykernel" 2>/dev/null; then
              ./scripts/install-deps.sh
            fi

            echo "📓 site notebooks env"
            echo "  Python: $(python --version 2>&1)"
            echo "  uv:     $(uv --version 2>&1)"
            echo ""
            echo "  just setup     # sync + register kernel"
            echo "  just lab       # JupyterLab on drafts/"
            echo "  just preview drafts/example.ipynb  # Quarto execute + HTML"
            echo "  just export drafts/example.ipynb   # Quarto → Astro blog md"
          '';
        };
      }
    );
}
