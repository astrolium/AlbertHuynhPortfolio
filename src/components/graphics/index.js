import Addepar from "./Addepar";
import Clio from "./Clio";
import DarwinAI from "./DarwinAI";
import Tecsys from "./Tecsys";

/* Keyed by `graphic` in data/index.json, so a chapter names its own figure. */
const GRAPHICS = { addepar: Addepar, clio: Clio, tecsys: Tecsys, darwinai: DarwinAI };

export default GRAPHICS;
