/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/fundus.json`.
 */
export type Fundus = {
  "address": "5Z1U7HwvHvLyaSqcKAa9VrydcVoDGhT6NC8SWMqERB6A",
  "metadata": {
    "name": "fundus",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "setGreeting",
      "docs": [
        "Sets a greeting message in the account."
      ],
      "discriminator": [
        63,
        232,
        53,
        234,
        129,
        147,
        78,
        101
      ],
      "accounts": [
        {
          "name": "greetingAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "greetingAccount",
      "discriminator": [
        190,
        16,
        56,
        57,
        246,
        26,
        112,
        24
      ]
    }
  ],
  "types": [
    {
      "name": "greetingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "message",
            "type": "string"
          }
        ]
      }
    }
  ]
};
