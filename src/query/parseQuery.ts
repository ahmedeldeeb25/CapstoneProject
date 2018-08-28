import { isString, isNumber } from "util";
import Log from "../Util";

/**
 * Take a query apart and determine if it is valid
 */
export default class ParseQuery {
    private S_KEY: string[] = ["Department", "ID", "Instructor", "Title", "UUID"];
    private M_KEY: string[] = ["Average", "Pass", "Fail", "Audit"];
    private MORE_KEYS: string = "and";
    private KIND: string = "courses";
    private S_OP: string[] = ["is", "is not", "includes", "does not include",
                              "begins with", "does not begin with", "ends with", "does not end with"];
    private M_OP: string[] = ["greater than", "less than", "equal to"];
    /**
     *
     * @param key string
     * returns true is key is in S_KEY or M_KEY
     */
    public is_key(key: string) {
        return this.S_KEY.includes(key) || this.M_KEY.includes(key);
    }

    /**
     *
     * @param sOP S_OP
     * return true if S_OP is valid, false if not
     */
    public valid_s_op(sOP: string) {
        const words: string[] = sOP.split(" ");
        const lastWord: string = words[words.length - 1];
        const phrase: string = words.slice(0, -1).join(" ");
        if (/^\"\w*\"$/.test(lastWord)) {
            return this.S_OP.includes(phrase);
        } else {
            return false;
        }
    }

    /**
     *
     * @param mOP M_OP
     * return true if M_OP is valid, false if not
     */
    public valid_m_op(mOP: string) {
        const words: string[] = mOP.split(" ");
        const length: number = words.length;
        const firstWord = words[0];
        const lastWord = parseFloat(words[length - 1]);
        if (firstWord !== "is" || isNaN(lastWord) || length < 4 || length > 5) {
            return false;
        } else {
            if (length === 5) {
                if (words[1] !== "not") {
                    return false;
                }
            }
            const phrase: string = length === 4 ? words[1] + " " + words[2] : words[2] + " " + words[3];
            return this.M_OP.includes(phrase);
        }
    }

}
