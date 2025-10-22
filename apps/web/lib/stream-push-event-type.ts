type StreamChannelMember = {
  user_id: string;
  user: {
    id: string;
    name: string;
    language: string;
    role: string;
    teams: string[];
    created_at: string;
    updated_at: string;
    banned: boolean;
    online: boolean;
    last_active: string;
    blocked_user_ids: string[];
    shadow_banned: boolean;
    invisible: boolean;
    channel_last_read_at: string;
    unread_count?: number;
    unread_thread_messages?: number;
    channel_unread_count?: number;
    total_unread_count?: number;
    unread_channels?: number;
    unread_threads?: number;
    username?: string;
  };
  status: string; // e.g., 'member'
  created_at: string;
  updated_at: string;
  banned: boolean;
  shadow_banned: boolean;
  role: string; // e.g., 'owner', 'member'
  channel_role: string; // e.g., 'channel_member'
  notifications_muted: boolean;
};

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
  members: StreamChannelMember[];
  channel_type: string;
  channel_id: string;
};
