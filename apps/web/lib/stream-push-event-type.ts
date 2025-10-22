export type StreamMessageNewEvent = {
  type: "message.new";
  cid: string;
  message: {
    id: string;
    text: string;
    html: string;
    type: string;
    user: {
      id: string;
      role: string;
      created_at: string;
      updated_at: string;
      banned: boolean;
      online: boolean;
    };
    attachments: any[];
    latest_reactions: any[];
    own_reactions: any[];
    reaction_counts: Record<string, number> | null;
    reaction_scores: Record<string, number>;
    reply_count: number;
    created_at: string;
    updated_at: string;
    mentioned_users: any[];
  };
  user: {
    id: string;
    role: string;
    created_at: string;
    updated_at: string;
    banned: boolean;
    online: boolean;
    channel_unread_count: number;
    channel_last_read_at: string;
    total_unread_count: number;
    unread_channels: number;
    unread_count: number;
  };
  created_at: string;
  members: Array<{
    user_id: string;
    user: Record<string, any>; // "user": ["Object"] in your JSON, so generic
    created_at: string;
    updated_at: string;
    notifications_muted?: boolean; // optional because not all members have it
  }>;
  channel_type: string;
  channel_id: string;
};
