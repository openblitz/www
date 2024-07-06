use tokenizers::{Tokenizer};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen(start)]
pub fn start() -> Result<(), JsValue> {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();

    Ok(())
}

#[wasm_bindgen]
pub struct TokenizerWrapper {
    tokenizer: Tokenizer,
}

#[wasm_bindgen]
impl TokenizerWrapper {
    pub fn get_vocab_size(&self) -> usize {
        self.tokenizer.get_vocab_size(true)
    }

    pub fn get_vocab(&self) -> JsValue {
        let vocab = self.tokenizer.get_vocab(true);
        serde_wasm_bindgen::to_value(&vocab).unwrap()
    }

    pub fn encode(&self, string: &str) -> JsValue {
        let encoding = self.tokenizer.encode(string, false).unwrap();
        serde_wasm_bindgen::to_value(&encoding).unwrap()
    }

    pub fn decode(&self, ids: Vec<u32>) -> String {
        self.tokenizer.decode(&ids, false).unwrap()
    }

    #[wasm_bindgen]
    pub fn from(tokenizer_json: &str) -> TokenizerWrapper {
        TokenizerWrapper {
            tokenizer: tokenizer_json.parse::<Tokenizer>().unwrap(),
        }
    }
}

#[cfg(test)]
mod tests {
    // use super::*;
    //
    // #[test]
    // fn it_works() {
    //     let result = add(2, 2);
    //     assert_eq!(result, 4);
    // }
}
