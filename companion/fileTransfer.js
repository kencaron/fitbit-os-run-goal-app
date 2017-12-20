import { outbox } from 'file-transfer';
import { encode } from 'cbor';
import { log } from './../common/util.js'
import { WEB_STATE_FILENAME } from './../common/constants';

export function enqueue(data) {
  const arrayBuffer = encode(data);
  outbox
    .enqueue(WEB_STATE_FILENAME, arrayBuffer)
    .then(ft => {
      // Queued successfully
      log("Transfer of '" + WEB_STATE_FILENAME + "' successfully queued.");
    }).catch(error => {
      // Failed to queue
      throw new Error("Failed to queue '" + WEB_STATE_FILENAME + "'. Error: " + error);
    });
}