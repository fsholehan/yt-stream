import { BG } from "bgutils-js";
import { JSDOM } from "jsdom";
import { Innertube } from "youtubei.js";

export async function getPoToken() {
  const dom = new JSDOM();

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
  });

  const tempTube = await Innertube.create({ retrieve_player: false });

  const requestKey = "O43z0dpjhgX20SCx4KAo";
  const visitorData = tempTube.session.context.client.visitorData;

  const bgConfig = {
    fetch: (input, init) => fetch(input, init),
    globalObj: globalThis,
    identifier: visitorData,
    requestKey,
  };

  const challenge = await BG.Challenge.create(bgConfig);
  if (!challenge) throw new Error("Gagal ambil challenge");

  const script =
    challenge.interpreterJavascript
      .privateDoNotAccessOrElseSafeScriptWrappedValue;
  if (!script) throw new Error("Gagal load VM");

  new Function(script)();

  const result = await BG.PoToken.generate({
    program: challenge.program,
    globalName: challenge.globalName,
    bgConfig,
  });

  return {
    po_token: result.poToken,
    visitor_data: visitorData,
  };
}
