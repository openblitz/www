export type Encoding = {
	attention_mask: number[];
	ids: number[];
	offsets: number[][];
	overflowing: number[][];
  sequence_ranges: Map<number, {
		start: number
		end: number
	}>;
	tokens: string[];
	type_ids: number[];
	words: number[];
}
