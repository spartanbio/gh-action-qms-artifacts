import * as core from '@actions/core';
import * as github from '@actions/github';
import * as glob from '@actions/glob';
import { create, UploadOptions } from '@actions/artifact';
import { lstatSync } from 'fs';

async function main (): Promise<void> {
  try {
    const globPatterns = core.getInput('files');
    const searchResults = await globFiles(globPatterns);

    const artifactClient = create();
    const artifactName = github.context.repo.repo;
    const options: UploadOptions = {
      continueOnError: false,
    };
    const uploadResponse = await artifactClient.uploadArtifact(
      artifactName,
      searchResults,
      '.',
      options,
    );

    if (uploadResponse.failedItems.length > 0) {
      core.setFailed(
        // eslint-disable-next-line max-len
        `An error was encountered when uploading ${uploadResponse.artifactName}. There were ${uploadResponse.failedItems.length} items that failed to upload.`,
      );
    } else {
      core.info(`Artifact ${uploadResponse.artifactName} has been successfully uploaded!`);
    }
  } catch (err) {
    core.setFailed(err.message);
  }
}

main();

/**
 * Find files based on glob pattern
 * @param pattern The glob pattern
 */
async function globFiles (pattern: string): Promise<string[]> {
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
