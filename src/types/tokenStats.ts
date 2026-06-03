export interface TokenStatsCategorySpend {
  key: string;
  label: string;
  tokens: number;
}

export interface TokenStatsSubcategorySpend {
  id: number;
  slug: string;
  label: string;
  category: string;
  tokens: number;
}

export interface TokenStatsResponse {
  status: string;
  balance: number;
  earned: {
    total: number;
    from_purchases: number;
    from_help: number;
    from_received_contributions: number;
  };
  spent: {
    total: number;
    on_posts: number;
    on_topups: number;
    on_donations: number;
    by_category: TokenStatsCategorySpend[];
    by_subcategory: TokenStatsSubcategorySpend[];
  };
  meta: {
    ledger_from: string | null;
    historical_before_ledger: string;
  };
}
