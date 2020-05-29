import { create, UploadOptions } from '@actions/artifact';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { globFiles, writeAdditionalArtifacts } from './utils';

async function main (): Promise<void> {
  try {
    await writeAdditionalArtifacts();

    // Search for files to upload
    const globPatterns = core.getInput('files');
    const searchResults = await globFiles(globPatterns);

    if (searchResults.length === 0) {
      return core.info('The provided paths matched no files. No files will be uploaded.');
    }

    core.info(`${searchResults.length} files will be uploaded`);

    // Upload the files
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
