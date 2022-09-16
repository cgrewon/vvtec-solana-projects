export type VvtecOnchain = {
  version: "0.1.0";
  name: "vvtec_onchain";
  instructions: [
    {
      name: "create";
      accounts: [
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "oracle";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "feed";
          type: {
            defined: "FeedData";
          };
        }
      ];
    },
    {
      name: "update";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
        {
          name: "oracle";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "value";
          type: {
            option: "u128";
          };
        }
      ];
    },
    {
      name: "delete";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
        {
          name: "oracle";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "oracle";
      docs: [
        "The data in a an oracle feed is always prefixed with this structure.",
        "The remainder of the datata in a specific feed depends on the `class`"
      ];
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            docs: [
              "The owner of this feed.",
              "",
              "Only owners have write-access to feeds, including adding or removing child",
              "feeds, or setting a leaf value to some sequence of bytes."
            ];
            type: "publicKey";
          },
          {
            name: "name";
            docs: [
              "A UTF-8 encoded human-readable name of this feed.",
              "",
              "This name is used in hash calculation along with its parent",
              "This name may contain only lowercase letters, digits 0-9 and dashes `-`."
            ];
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "updatedAt";
            docs: [
              "A unix timestamp of the most recent update of the feed value.",
              "This value is provided by the validator sysclock account",
              "automatically during updates."
            ];
            type: "i64";
          },
          {
            name: "value";
            docs: [
              "The value that is stored within a single feed. In most cases, intermediate",
              "nodes or non-leaf feeds will be None (although some may decide to have a",
              "summary value for their children), and leaf feeds will have concrete values."
            ];
            type: {
              option: "u128";
            };
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "FeedData";
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            type: "publicKey";
          },
          {
            name: "name";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "value";
            type: {
              option: "u128";
            };
          }
        ];
      };
    }
  ];
};

export const IDL: VvtecOnchain = {
  version: "0.1.0",
  name: "vvtec_onchain",
  instructions: [
    {
      name: "create",
      accounts: [
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "oracle",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "feed",
          type: {
            defined: "FeedData",
          },
        },
      ],
    },
    {
      name: "update",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "oracle",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "value",
          type: {
            option: "u128",
          },
        },
      ],
    },
    {
      name: "delete",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "oracle",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "oracle",
      docs: [
        "The data in a an oracle feed is always prefixed with this structure.",
        "The remainder of the datata in a specific feed depends on the `class`",
      ],
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            docs: [
              "The owner of this feed.",
              "",
              "Only owners have write-access to feeds, including adding or removing child",
              "feeds, or setting a leaf value to some sequence of bytes.",
            ],
            type: "publicKey",
          },
          {
            name: "name",
            docs: [
              "A UTF-8 encoded human-readable name of this feed.",
              "",
              "This name is used in hash calculation along with its parent",
              "This name may contain only lowercase letters, digits 0-9 and dashes `-`.",
            ],
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "updatedAt",
            docs: [
              "A unix timestamp of the most recent update of the feed value.",
              "This value is provided by the validator sysclock account",
              "automatically during updates.",
            ],
            type: "i64",
          },
          {
            name: "value",
            docs: [
              "The value that is stored within a single feed. In most cases, intermediate",
              "nodes or non-leaf feeds will be None (although some may decide to have a",
              "summary value for their children), and leaf feeds will have concrete values.",
            ],
            type: {
              option: "u128",
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "FeedData",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "name",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "value",
            type: {
              option: "u128",
            },
          },
        ],
      },
    },
  ],
};
