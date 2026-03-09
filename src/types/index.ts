export type Role = "ADMIN" | "REVIEWER" | "AUTHOR";

export type SubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DESK_REVIEW"
  | "DESK_REJECTED"
  | "PEER_REVIEW"
  | "REVISION_REQUESTED"
  | "REVISION_SUBMITTED"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_COPYEDITING"
  | "PUBLISHED"
  | "WITHDRAWN";

export type ReviewDecision =
  | "ACCEPT"
  | "MINOR_REVISION"
  | "MAJOR_REVISION"
  | "REJECT";

export type InvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED";

// Extend next-auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }
}
