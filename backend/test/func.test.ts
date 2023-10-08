import { test } from "node:test";

import { Verbal } from "../utils/logger.js";
//_ CODE
import { JSONifyCSV } from "../utils/func.js";


const TEST_LOGGER = new Verbal("🧪TEST🧪");


test("converts csv to json", async () => {
    await JSONifyCSV("./public/My Apple Music Library.csv", null);
    TEST_LOGGER.info(process.cwd());
});