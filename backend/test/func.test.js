import { it } from "node:test";
import {Verbal} from "../dist/utils/logger.js";
import {checkEnvironment} from "../dist/utils/func.js";


const TEST_LOGGER = new Verbal("🧪TEST🧪");


it("convert csv to json", () => {
    TEST_LOGGER.info(checkEnvironment());
    TEST_LOGGER.info(process.cwd());
});