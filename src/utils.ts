import * as core from '@actions/core';
import * as glob from '@actions/glob';
import { lstatSync, outputFile } from 'fs-extra';

import { exec } from '@actions/exec';

/**
 * Find files based on glob pattern
 * @param pattern The glob pattern
 */
export async function globFiles (pattern: string): Promise<string[]> {
  const globber = await glob.create(pattern);
  const files = await globber.glob();
  const searchResults = [];

  /*
    Directories will be rejected if attempted to be uploaded. This includes just empty
    directories so filter any directories out from the raw search results
  */
  for (const searchResult of files) {
    if (!lstatSync(searchResult).isDirectory()) {
      core.debug(`File:${searchResult} was found using the provided searchPath`);
      searchResults.push(searchResult);
    } else {
      core.debug(`Removing ${searchResult} from rawSearchResults because it is a directory`);
    }
  }
  return searchResults;
}

/**
 * Write the artifacts defined in `../action.yml`
 */
export async function writeAdditionalArtifacts (): Promise<void> {
  const env = core.getInput('env');
  const hash = core.getInput('git-hash');

  if (env) {
    await outputFile('./.env', env);
    core.info('`.env` written');
  }

  if (hash && hash !== 'false') {
    await outputFile('./git-hash.txt', hash);
    core.info('`git-hash.txt` written');
  }
}

/**
 * Gets latest git version tag
 */
export async function getVersionTag (): Promise<string> {
  core.info('Fetching tags');
  await exec('git fetch --depth=1 origin "+refs/tags/*:refs/tags/*"');

  let tagSHA = '';

  core.info('Finding latest version');
  await exec('git rev-list --tags="v[0-9]*"  --max-count=1', [], {
    listeners: {
      stdout: (data) => {
        tagSHA = data.toString().trim();
      },
    },
  });

  let tag = '';

  await exec(`git describe --tags ${tagSHA}`, [], {
    listeners: {
      stdout: (data) => {
        tag = data.toString().trim();
      },
    },
  });

  return tag;
}
