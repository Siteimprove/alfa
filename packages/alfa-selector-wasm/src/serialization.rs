//! Binary DOM deserialization.
//!
//! Decodes the compact representation produced by the TypeScript serializer
//! (`ts/serialize.ts`) into the `ElementData` arena consumed by `dom.rs`.
//!
//! ## Format (all integers little-endian; `u32::MAX` = "none")
//!
//! ```text
//! Header:
//!   u32  magic = 0x414C4641 ("ALFA")
//!   u32  version = 1
//!   u32  num_strings
//!   u32  num_elements
//!
//! String table (num_strings entries):
//!   u32  byte_length
//!   [u8] utf-8 bytes
//!
//! Element records (num_elements entries):
//!   u32  local_name    (string index)
//!   u32  namespace     (string index; index 0 is the empty string)
//!   u32  id            (string index, or u32::MAX)
//!   u32  parent        (element index, or u32::MAX)
//!   u32  first_child   (element index, or u32::MAX)
//!   u32  next_sibling  (element index, or u32::MAX)
//!   u32  prev_sibling  (element index, or u32::MAX)
//!   u8   flags         (bit0 = is_root)
//!   u32  num_classes;    [u32] class string indices
//!   u32  num_attributes; [u32,u32] (name idx, value idx) pairs
//! ```

use crate::dom::ElementData;

const MAGIC: u32 = 0x414C_4641;
const VERSION: u32 = 1;
const NONE: u32 = u32::MAX;

struct Reader<'a> {
    bytes: &'a [u8],
    pos: usize,
}

impl<'a> Reader<'a> {
    fn new(bytes: &'a [u8]) -> Self {
        Reader { bytes, pos: 0 }
    }

    fn u8(&mut self) -> Result<u8, String> {
        let byte = *self
            .bytes
            .get(self.pos)
            .ok_or("unexpected end of input reading u8")?;
        self.pos += 1;
        Ok(byte)
    }

    fn u32(&mut self) -> Result<u32, String> {
        let end = self.pos + 4;
        let slice = self
            .bytes
            .get(self.pos..end)
            .ok_or("unexpected end of input reading u32")?;
        self.pos = end;
        Ok(u32::from_le_bytes([slice[0], slice[1], slice[2], slice[3]]))
    }

    fn bytes(&mut self, len: usize) -> Result<&'a [u8], String> {
        let end = self.pos + len;
        let slice = self
            .bytes
            .get(self.pos..end)
            .ok_or("unexpected end of input reading bytes")?;
        self.pos = end;
        Ok(slice)
    }
}

fn opt_index(raw: u32) -> Option<usize> {
    if raw == NONE {
        None
    } else {
        Some(raw as usize)
    }
}

/// Decode a binary DOM buffer into the element arena.
pub fn decode(bytes: &[u8]) -> Result<Vec<ElementData>, String> {
    let mut reader = Reader::new(bytes);

    let magic = reader.u32()?;
    if magic != MAGIC {
        return Err(format!("bad magic: {magic:#x}"));
    }
    let version = reader.u32()?;
    if version != VERSION {
        return Err(format!("unsupported version: {version}"));
    }

    let num_strings = reader.u32()? as usize;
    let num_elements = reader.u32()? as usize;

    // String table.
    let mut strings = Vec::with_capacity(num_strings);
    for _ in 0..num_strings {
        let len = reader.u32()? as usize;
        let raw = reader.bytes(len)?;
        let string = std::str::from_utf8(raw)
            .map_err(|e| format!("invalid utf-8 in string table: {e}"))?
            .to_owned();
        strings.push(string);
    }

    let string_at = |index: u32| -> Result<String, String> {
        strings
            .get(index as usize)
            .cloned()
            .ok_or_else(|| format!("string index out of range: {index}"))
    };

    // Element records.
    let mut elements = Vec::with_capacity(num_elements);
    for _ in 0..num_elements {
        let local_name = string_at(reader.u32()?)?;
        let namespace = string_at(reader.u32()?)?;

        let id_raw = reader.u32()?;
        let id = if id_raw == NONE {
            None
        } else {
            Some(string_at(id_raw)?)
        };

        let parent = opt_index(reader.u32()?);
        let first_child = opt_index(reader.u32()?);
        let next_sibling = opt_index(reader.u32()?);
        let prev_sibling = opt_index(reader.u32()?);

        let flags = reader.u8()?;
        let is_root = flags & 0b1 != 0;

        let num_classes = reader.u32()? as usize;
        let mut classes = Vec::with_capacity(num_classes);
        for _ in 0..num_classes {
            classes.push(string_at(reader.u32()?)?);
        }

        let num_attributes = reader.u32()? as usize;
        let mut attributes = Vec::with_capacity(num_attributes);
        for _ in 0..num_attributes {
            let name = string_at(reader.u32()?)?;
            let value = string_at(reader.u32()?)?;
            attributes.push((name, value));
        }

        elements.push(ElementData {
            local_name,
            namespace,
            id,
            classes,
            attributes,
            parent,
            first_child,
            next_sibling,
            prev_sibling,
            is_root,
        });
    }

    Ok(elements)
}
