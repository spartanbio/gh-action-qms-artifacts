import * as core from '@actions/core';
import * as glob from '@actions/glob';
import { lstatSync, outputFile } from 'fs-extra';

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
