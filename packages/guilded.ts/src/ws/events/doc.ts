import { WSEvents } from 'guilded-api-typings';
import { Client } from '../../structures/Client';
import { Doc } from '../../structures/Doc';
import { DocChannel } from '../../structures/channel/DocChannel';

/**
 * Handle the DocCreated event.
 * @param client The client instance.
 * @param data The data of the event.
 */
export async function created(client: Client, data: WSEvents['DocCreated']) {
	const channel = (await client.channels.fetch(data.doc.channelId)) as DocChannel;
	const doc = new Doc(channel, data.doc);
	if (client.options.cacheDocs) channel.docs.cache.set(doc.id, doc);
	client.emit('docCreate', doc);
}

/**
 * Handle the DocUpdated event.
 * @param client The client instance.
 * @param data The data of the event.
 */
export async function updated(client: Client, data: WSEvents['DocUpdated']) {
	const channel = (await client.channels.fetch(data.doc.channelId)) as DocChannel;
	const doc = new Doc(channel, data.doc);
	if (client.options.cacheDocs) channel.docs.cache.set(doc.id, doc);
	client.emit('docEdit', doc);
}

/**
 * Handle the DocDeleted event.
 * @param client The client instance.
 * @param data The data of the event.
 */
export async function deleted(client: Client, data: WSEvents['DocDeleted']) {
	const channel = (await client.channels.fetch(data.doc.channelId)) as DocChannel;
	const doc = new Doc(channel, data.doc);
	channel.docs.cache.delete(doc.id);
	client.emit('docDelete', doc);
}