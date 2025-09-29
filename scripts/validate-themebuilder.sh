#!/usr/bin/env bash
set -Eeuo pipefail

root="design/themebuilder/export"
if [[ ! -d "$root" ]]; then
  echo "::notice title=ThemeBuilder::No $root/ directory; nothing to validate."
  exit 0
fi

echo "Scanning $root for packages..."
found_any="false"
failed_any="false"

shopt -s nullglob
for pkg in "$root"/*; do
  [[ -d "$pkg" ]] || continue
  found_any="true"

  echo "Checking package: $pkg"
  pkg_json="$pkg/package.json"
  dist_dir="$pkg/dist"

  if [[ ! -f "$pkg_json" ]]; then
    echo "::error file=$pkg::Missing package.json"
    failed_any="true"
  fi

  if [[ ! -d "$dist_dir" ]]; then
    echo "::error file=$pkg::Missing dist/ directory"
    failed_any="true"
  else
    if ! find "$dist_dir" -type f -print -quit | grep -q .; then
      echo "::error file=$dist_dir::dist/ is empty"
      failed_any="true"
    fi

    if ! git ls-files -- "$dist_dir" | grep -q .; then
      echo "::error::No files under dist/ are tracked by git."
      echo "Tips:"
      echo "- Ensure your .gitignore has this exception AFTER any 'dist/' rule:"
      echo "    !design/themebuilder/export/**/dist/**"
      echo "- Re-add & commit:"
      echo "    git add -f \"$dist_dir\""
      echo "    git commit -m \"Vendor ThemeBuilder dist\""
      failed_any="true"
    fi

    if find "$dist_dir" -type f -size +95M -print -quit | grep -q .; then
      echo "::error::One or more files in dist/ exceed ~95MB."
      echo "Use Git LFS or reduce bundle size:"
      echo "  git lfs install"
      echo "  git lfs track \"design/themebuilder/export/**/dist/**\""
      echo "  git add .gitattributes && git commit -m \"Track ThemeBuilder dist with LFS\""
      failed_any="true"
    fi
  fi
done

if [[ "$found_any" != "true" ]]; then
  echo "::warning title=ThemeBuilder::No packages found under $root/. If this is expected, ignore this check."
fi

if [[ -f .gitignore ]]; then
  if grep -Eq '^[[:space:]]*dist/' .gitignore; then
    if ! grep -Fq '!design/themebuilder/export/**/dist/**' .gitignore; then
      echo "::warning file=.gitignore::You ignore 'dist/' but don't have the exception '!design/themebuilder/export/**/dist/**'. Consider adding it."
    fi
  fi
fi

if [[ "$failed_any" == "true" ]]; then
  echo "ThemeBuilder vendor validation failed."
  exit 1
fi

echo "ThemeBuilder vendor validation passed."
