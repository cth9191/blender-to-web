"""Copy the verified reference into a fresh destination, without overwriting files."""
import argparse
from pathlib import Path
import shutil

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('destination',type=Path)
 args=parser.parse_args()
 source=Path(__file__).resolve().parents[1]/'assets/reference-project'
 target=args.destination.expanduser().resolve()
 if target.exists():parser.error('Destination already exists. Choose a new project directory.')
 if source==target or source in target.parents:parser.error('Choose a destination outside the bundled reference.')
 shutil.copytree(source,target)
 print('Created:',target)
 print('From that folder, run: node outputs/infinity-site/server.cjs')
 print('Default port: 4175. Set PORT to another free port if the original demo is running.')

if __name__=='__main__':main()
