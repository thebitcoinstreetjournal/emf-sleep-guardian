import { generatePrivateKey, getPublicKey, finishEvent, SimplePool } from 'nostr-tools';

export class NostrRelay {
  constructor(relayUrl) {
    this.relayUrl = relayUrl;
    this.pool = new SimplePool();
    this.privateKey = generatePrivateKey();
    this.publicKey = getPublicKey(this.privateKey);
    this.subscriptions = new Map();
  }

  async connect() {
    try {
      console.log(`Connecting to Nostr relay: ${this.relayUrl}`);
      return true;
    } catch (error) {
      console.error('Failed to connect to Nostr relay:', error);
      throw error;
    }
  }

  async publish(event) {
    try {
      const signedEvent = finishEvent(event, this.privateKey);
      await this.pool.publish([this.relayUrl], signedEvent);
      console.log('Event published to Nostr');
      return true;
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  subscribe(filters, callback) {
    try {
      const sub = this.pool.sub([this.relayUrl], filters);
      
      sub.on('event', (event) => {
        if (callback) {
          callback(event);
        }
      });

      sub.on('eose', () => {
        console.log('End of stored events');
      });

      const subId = Date.now().toString();
      this.subscriptions.set(subId, sub);
      
      return subId;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    }
  }

  unsubscribe(subId) {
    const sub = this.subscriptions.get(subId);
    if (sub) {
      sub.unsub();
      this.subscriptions.delete(subId);
    }
  }

  disconnect() {
    this.subscriptions.forEach((sub) => {
      sub.unsub();
    });
    this.subscriptions.clear();
    this.pool.close([this.relayUrl]);
  }
}