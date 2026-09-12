"""Install this repository as a Codex skill without overwriting an existing skill."""
import argparse
import os
from pathlib import Path
import shutil

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--skills-dir', type=Path, help='Override the Codex skills directory')
    args = parser.parse_args()
    source = Path(__file__).resolve().parents[1]
    codex_home = Path(os.environ.get('CODEX_HOME', str(Path.home() / '.codex')))
    parent = args.skills_dir or codex_home / 'skills'
    target = (parent.expanduser() / 'blender-to-web').resolve()
    if target.exists():
        parser.error(f'Skill already exists: {target}. Review or update that installation explicitly.')
    if source == target or source in target.parents:
        parser.error('Choose a skills directory outside this repository.')
    shutil.copytree(source, target, ignore=shutil.ignore_patterns('.git', '__pycache__', '*.pyc'))
    print(f'Installed: {target}')
    print('Open a fresh Codex task and invoke $blender-to-web.')

if __name__ == '__main__':
    main()
