09:27:35.691 Running build in Washington, D.C., USA (East) – iad1
09:27:35.692 Build machine configuration: 2 cores, 8 GB
09:27:35.840 Cloning github.com/pcarvajalr/uni_app_web (Branch: main, Commit: d901a72)
09:27:35.841 Previous build caches not available.
09:27:36.082 Cloning completed: 242.000ms
09:27:36.502 Running "vercel build"
09:27:36.897 Vercel CLI 48.10.5
09:27:37.505 Running "install" command: `npm install`...
09:27:47.052 
09:27:47.053 added 499 packages, and audited 500 packages in 9s
09:27:47.053 
09:27:47.054 78 packages are looking for funding
09:27:47.054   run `npm fund` for details
09:27:47.076 
09:27:47.081 4 vulnerabilities (3 moderate, 1 high)
09:27:47.081 
09:27:47.082 To address all issues (including breaking changes), run:
09:27:47.082   npm audit fix --force
09:27:47.082 
09:27:47.082 Run `npm audit` for details.
09:27:47.337 
09:27:47.340 > uni-app@1.0.0 build
09:27:47.340 > tsc -b && vite build
09:27:47.340 
09:27:54.243 src/lib/auth.tsx(57,27): error TS2339: Property 'id' does not exist on type 'never'.
09:27:54.244 src/lib/auth.tsx(58,29): error TS2339: Property 'full_name' does not exist on type 'never'.
09:27:54.244 src/lib/auth.tsx(59,30): error TS2339: Property 'email' does not exist on type 'never'.
09:27:54.244 src/lib/auth.tsx(60,29): error TS2339: Property 'role' does not exist on type 'never'.
09:27:54.247 src/lib/auth.tsx(61,34): error TS2339: Property 'student_id' does not exist on type 'never'.
09:27:54.247 src/lib/auth.tsx(62,31): error TS2339: Property 'career' does not exist on type 'never'.
09:27:54.247 src/lib/auth.tsx(63,33): error TS2339: Property 'semester' does not exist on type 'never'.
09:27:54.247 src/lib/auth.tsx(64,30): error TS2339: Property 'phone' does not exist on type 'never'.
09:27:54.248 src/lib/auth.tsx(65,35): error TS2339: Property 'avatar_url' does not exist on type 'never'.
09:27:54.257 src/lib/auth.tsx(66,28): error TS2339: Property 'bio' does not exist on type 'never'.
09:27:54.258 src/lib/auth.tsx(67,31): error TS2339: Property 'rating' does not exist on type 'never'.
09:27:54.258 src/lib/auth.tsx(68,36): error TS2339: Property 'total_sales' does not exist on type 'never'.
09:27:54.258 src/lib/auth.tsx(69,48): error TS2339: Property 'total_tutoring_sessions' does not exist on type 'never'.
09:27:54.258 src/lib/auth.tsx(70,36): error TS2339: Property 'is_verified' does not exist on type 'never'.
09:27:54.258 src/lib/auth.tsx(71,33): error TS2339: Property 'is_tutor' does not exist on type 'never'.
09:27:54.258 src/lib/auth.tsx(211,17): error TS2345: Argument of type 'Partial<{ id: string; email: string; full_name: string; role: "user" | "admin"; avatar_url: string | null; phone: string | null; student_id: string | null; career: string | null; semester: number | null; ... 8 more ...; updated_at: string; }>' is not assignable to parameter of type 'never'.
09:27:54.259 src/lib/auth.tsx(226,22): error TS2339: Property 'full_name' does not exist on type 'never'.
09:27:54.259 src/lib/auth.tsx(227,22): error TS2339: Property 'role' does not exist on type 'never'.
09:27:54.259 src/lib/auth.tsx(228,27): error TS2339: Property 'student_id' does not exist on type 'never'.
09:27:54.259 src/lib/auth.tsx(229,24): error TS2339: Property 'career' does not exist on type 'never'.
09:27:54.259 src/lib/auth.tsx(230,26): error TS2339: Property 'semester' does not exist on type 'never'.
09:27:54.260 src/lib/auth.tsx(231,23): error TS2339: Property 'phone' does not exist on type 'never'.
09:27:54.260 src/lib/auth.tsx(232,28): error TS2339: Property 'avatar_url' does not exist on type 'never'.
09:27:54.260 src/lib/auth.tsx(233,21): error TS2339: Property 'bio' does not exist on type 'never'.
09:27:54.260 src/lib/auth.tsx(234,24): error TS2339: Property 'rating' does not exist on type 'never'.
09:27:54.260 src/lib/auth.tsx(235,29): error TS2339: Property 'is_verified' does not exist on type 'never'.
09:27:54.260 src/lib/auth.tsx(236,26): error TS2339: Property 'is_tutor' does not exist on type 'never'.
09:27:54.261 src/services/coupons.service.ts(92,12): error TS2352: Conversion of type 'null' to type '{ id: string; code: string; title: string; description: string | null; discount_type: "percentage" | "fixed_amount"; discount_value: number; min_purchase_amount: number; max_discount_amount: number | null; ... 8 more ...; created_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.262 src/services/coupons.service.ts(124,17): error TS2339: Property 'is_active' does not exist on type 'never'.
09:27:54.262 src/services/coupons.service.ts(130,39): error TS2339: Property 'valid_from' does not exist on type 'never'.
09:27:54.262 src/services/coupons.service.ts(131,40): error TS2339: Property 'valid_until' does not exist on type 'never'.
09:27:54.263 src/services/coupons.service.ts(142,16): error TS2339: Property 'usage_limit' does not exist on type 'never'.
09:27:54.263 src/services/coupons.service.ts(142,38): error TS2339: Property 'used_count' does not exist on type 'never'.
09:27:54.263 src/services/coupons.service.ts(142,59): error TS2339: Property 'usage_limit' does not exist on type 'never'.
09:27:54.263 src/services/coupons.service.ts(147,16): error TS2339: Property 'applicable_to' does not exist on type 'never'.
09:27:54.263 src/services/coupons.service.ts(147,40): error TS2339: Property 'applicable_to' does not exist on type 'never'.
09:27:54.264 src/services/coupons.service.ts(147,75): error TS2339: Property 'applicable_to' does not exist on type 'never'.
09:27:54.264 src/services/coupons.service.ts(148,64): error TS2339: Property 'applicable_to' does not exist on type 'never'.
09:27:54.264 src/services/coupons.service.ts(152,16): error TS2339: Property 'category_ids' does not exist on type 'never'.
09:27:54.264 src/services/coupons.service.ts(153,19): error TS2339: Property 'category_ids' does not exist on type 'never'.
09:27:54.264 src/services/coupons.service.ts(159,33): error TS2339: Property 'min_purchase_amount' does not exist on type 'never'.
09:27:54.264 src/services/coupons.service.ts(160,79): error TS2339: Property 'min_purchase_amount' does not exist on type 'never'.
09:27:54.265 src/services/coupons.service.ts(171,32): error TS2339: Property 'used_count' does not exist on type 'never'.
09:27:54.265 src/services/coupons.service.ts(171,53): error TS2339: Property 'usage_per_user' does not exist on type 'never'.
09:27:54.265 src/services/coupons.service.ts(178,16): error TS2339: Property 'discount_type' does not exist on type 'never'.
09:27:54.265 src/services/coupons.service.ts(179,49): error TS2339: Property 'discount_value' does not exist on type 'never'.
09:27:54.265 src/services/coupons.service.ts(182,18): error TS2339: Property 'max_discount_amount' does not exist on type 'never'.
09:27:54.265 src/services/coupons.service.ts(182,65): error TS2339: Property 'max_discount_amount' does not exist on type 'never'.
09:27:54.265 src/services/coupons.service.ts(183,33): error TS2339: Property 'max_discount_amount' does not exist on type 'never'.
09:27:54.265 src/services/coupons.service.ts(187,40): error TS2339: Property 'discount_value' does not exist on type 'never'.
09:27:54.265 src/services/coupons.service.ts(217,17): error TS2345: Argument of type '{ used_count: any; last_used_at: string; }' is not assignable to parameter of type 'never'.
09:27:54.265 src/services/coupons.service.ts(218,37): error TS2339: Property 'used_count' does not exist on type 'never'.
09:27:54.265 src/services/coupons.service.ts(221,33): error TS2339: Property 'id' does not exist on type 'never'.
09:27:54.265 src/services/coupons.service.ts(229,14): error TS2352: Conversion of type 'null' to type '{ id: string; user_id: string; coupon_id: string; used_count: number; last_used_at: string | null; created_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.266 src/services/coupons.service.ts(234,10): error TS2769: No overload matches this call.
09:27:54.266   Overload 1 of 2, '(values: never, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "user_coupons", never, "POST">', gave the following error.
09:27:54.266     Argument of type '{ user_id: string; coupon_id: string; used_count: number; last_used_at: string; }' is not assignable to parameter of type 'never'.
09:27:54.266   Overload 2 of 2, '(values: never[], options?: { count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "user_coupons", never, "POST">', gave the following error.
09:27:54.266     Object literal may only specify known properties, and 'user_id' does not exist in type 'never[]'.
09:27:54.266 src/services/coupons.service.ts(250,17): error TS2345: Argument of type 'any' is not assignable to parameter of type 'never'.
09:27:54.266 src/services/coupons.service.ts(250,40): error TS2339: Property 'raw' does not exist on type 'SupabaseClient<Database, "public", "public", never, { PostgrestVersion: "12"; }>'.
09:27:54.266 src/services/coupons.service.ts(253,14): error TS2352: Conversion of type 'null' to type '{ id: string; user_id: string; coupon_id: string; used_count: number; last_used_at: string | null; created_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.266 src/services/notifications.service.ts(75,15): error TS2345: Argument of type '{ is_read: boolean; read_at: string; }' is not assignable to parameter of type 'never'.
09:27:54.266 src/services/notifications.service.ts(87,12): error TS2352: Conversion of type 'null' to type '{ id: string; user_id: string; type: "system" | "security" | "message" | "sale" | "booking" | "review"; title: string; body: string; data: Json; image_url: string | null; action_url: string | null; is_read: boolean; read_at: string | null; created_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.266 src/services/notifications.service.ts(99,15): error TS2345: Argument of type '{ is_read: boolean; read_at: string; }' is not assignable to parameter of type 'never'.
09:27:54.266 src/services/notifications.service.ts(152,73): error TS2769: No overload matches this call.
09:27:54.266   Overload 1 of 2, '(values: never, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "notifications", never, "POST">', gave the following error.
09:27:54.267     Argument of type 'Omit<{ id?: string | undefined; user_id: string; type: "system" | "security" | "message" | "sale" | "booking" | "review"; title: string; body: string; data?: Json | undefined; image_url?: string | ... 1 more ... | undefined; action_url?: string | ... 1 more ... | undefined; is_read?: boolean | undefined; read_at?: s...' is not assignable to parameter of type 'never'.
09:27:54.267   Overload 2 of 2, '(values: never[], options?: { count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "notifications", never, "POST">', gave the following error.
09:27:54.267     Argument of type 'Omit<{ id?: string | undefined; user_id: string; type: "system" | "security" | "message" | "sale" | "booking" | "review"; title: string; body: string; data?: Json | undefined; image_url?: string | ... 1 more ... | undefined; action_url?: string | ... 1 more ... | undefined; is_read?: boolean | undefined; read_at?: s...' is not assignable to parameter of type 'never[]'.
09:27:54.267       Type 'Omit<{ id?: string | undefined; user_id: string; type: "system" | "security" | "message" | "sale" | "booking" | "review"; title: string; body: string; data?: Json | undefined; image_url?: string | ... 1 more ... | undefined; action_url?: string | ... 1 more ... | undefined; is_read?: boolean | undefined; read_at?: s...' is missing the following properties from type 'never[]': length, pop, push, concat, and 29 more.
09:27:54.267 src/services/notifications.service.ts(158,12): error TS2352: Conversion of type 'null' to type '{ id: string; user_id: string; type: "system" | "security" | "message" | "sale" | "booking" | "review"; title: string; body: string; data: Json; image_url: string | null; action_url: string | null; is_read: boolean; read_at: string | null; created_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.267 src/services/products.service.ts(134,12): error TS2352: Conversion of type 'null' to type 'ProductWithSeller' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.267 src/services/products.service.ts(144,68): error TS2769: No overload matches this call.
09:27:54.267   Overload 1 of 2, '(values: never, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "products", never, "POST">', gave the following error.
09:27:54.267     Argument of type 'Omit<{ id?: string | undefined; seller_id: string; category_id?: string | null | undefined; title: string; description: string; price: number; images?: string[] | undefined; condition?: "new" | ... 5 more ... | undefined; ... 7 more ...; updated_at?: string | undefined; }, "id" | ... 1 more ... | "updated_at">' is not assignable to parameter of type 'never'.
09:27:54.267   Overload 2 of 2, '(values: never[], options?: { count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "products", never, "POST">', gave the following error.
09:27:54.267     Argument of type 'Omit<{ id?: string | undefined; seller_id: string; category_id?: string | null | undefined; title: string; description: string; price: number; images?: string[] | undefined; condition?: "new" | ... 5 more ... | undefined; ... 7 more ...; updated_at?: string | undefined; }, "id" | ... 1 more ... | "updated_at">' is not assignable to parameter of type 'never[]'.
09:27:54.269       Type 'Omit<{ id?: string | undefined; seller_id: string; category_id?: string | null | undefined; title: string; description: string; price: number; images?: string[] | undefined; condition?: "new" | ... 5 more ... | undefined; ... 7 more ...; updated_at?: string | undefined; }, "id" | ... 1 more ... | "updated_at">' is missing the following properties from type 'never[]': length, pop, push, concat, and 29 more.
09:27:54.277 src/services/products.service.ts(150,12): error TS2352: Conversion of type 'null' to type '{ id: string; seller_id: string; category_id: string | null; title: string; description: string; price: number; images: string[]; condition: "new" | "like_new" | "good" | "fair" | "poor" | null; ... 7 more ...; updated_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.277 src/services/products.service.ts(160,68): error TS2345: Argument of type '{ id?: string | undefined; seller_id?: string | undefined; category_id?: string | null | undefined; title?: string | undefined; description?: string | undefined; price?: number | undefined; ... 9 more ...; updated_at?: string | undefined; }' is not assignable to parameter of type 'never'.
09:27:54.277 src/services/products.service.ts(166,12): error TS2352: Conversion of type 'null' to type '{ id: string; seller_id: string; category_id: string | null; title: string; description: string; price: number; images: string[]; condition: "new" | "like_new" | "good" | "fair" | "poor" | null; ... 7 more ...; updated_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.277 src/services/products.service.ts(176,62): error TS2345: Argument of type '{ status: string; }' is not assignable to parameter of type 'never'.
09:27:54.277 src/services/products.service.ts(192,55): error TS2345: Argument of type '{ table_name: string; row_id: string; column_name: string; }' is not assignable to parameter of type 'undefined'.
09:27:54.277 src/services/products.service.ts(202,17): error TS2345: Argument of type 'any' is not assignable to parameter of type 'never'.
09:27:54.278 src/services/products.service.ts(202,35): error TS2339: Property 'raw' does not exist on type 'SupabaseClient<Database, "public", "public", never, { PostgrestVersion: "12"; }>'.
09:27:54.278 src/services/products.service.ts(225,85): error TS2339: Property 'id' does not exist on type 'never'.
09:27:54.278 src/services/products.service.ts(234,58): error TS2769: No overload matches this call.
09:27:54.278   Overload 1 of 2, '(values: never, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "favorites", never, "POST">', gave the following error.
09:27:54.278     Argument of type '{ user_id: string; product_id: string; item_type: string; }' is not assignable to parameter of type 'never'.
09:27:54.278   Overload 2 of 2, '(values: never[], options?: { count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "favorites", never, "POST">', gave the following error.
09:27:54.278     Object literal may only specify known properties, and 'user_id' does not exist in type 'never[]'.
09:27:54.278 src/services/reports.service.ts(96,12): error TS2352: Conversion of type 'null' to type 'ReportWithReporter' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.278 src/services/reports.service.ts(106,67): error TS2769: No overload matches this call.
09:27:54.278   Overload 1 of 2, '(values: never, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "reports", never, "POST">', gave the following error.
09:27:54.278     Argument of type 'Omit<{ id?: string | undefined; reporter_id?: string | null | undefined; type: "security" | "emergency" | "maintenance" | "lost_found" | "other"; category?: string | null | undefined; ... 12 more ...; updated_at?: string | undefined; }, "id" | ... 1 more ... | "updated_at">' is not assignable to parameter of type 'never'.
09:27:54.278   Overload 2 of 2, '(values: never[], options?: { count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "reports", never, "POST">', gave the following error.
09:27:54.283     Argument of type 'Omit<{ id?: string | undefined; reporter_id?: string | null | undefined; type: "security" | "emergency" | "maintenance" | "lost_found" | "other"; category?: string | null | undefined; ... 12 more ...; updated_at?: string | undefined; }, "id" | ... 1 more ... | "updated_at">' is not assignable to parameter of type 'never[]'.
09:27:54.283       Type 'Omit<{ id?: string | undefined; reporter_id?: string | null | undefined; type: "security" | "emergency" | "maintenance" | "lost_found" | "other"; category?: string | null | undefined; ... 12 more ...; updated_at?: string | undefined; }, "id" | ... 1 more ... | "updated_at">' is missing the following properties from type 'never[]': length, pop, push, concat, and 29 more.
09:27:54.283 src/services/reports.service.ts(112,12): error TS2352: Conversion of type 'null' to type '{ id: string; reporter_id: string | null; type: "security" | "emergency" | "maintenance" | "lost_found" | "other"; category: string | null; title: string; description: string; location: string; ... 9 more ...; updated_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.284 src/services/reports.service.ts(122,67): error TS2345: Argument of type '{ id?: string | undefined; reporter_id?: string | null | undefined; type?: "security" | "emergency" | "maintenance" | "lost_found" | "other" | undefined; category?: string | null | undefined; ... 12 more ...; updated_at?: string | undefined; }' is not assignable to parameter of type 'never'.
09:27:54.284 src/services/reports.service.ts(128,12): error TS2352: Conversion of type 'null' to type '{ id: string; reporter_id: string | null; type: "security" | "emergency" | "maintenance" | "lost_found" | "other"; category: string | null; title: string; description: string; location: string; ... 9 more ...; updated_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.284 src/services/reports.service.ts(154,67): error TS2345: Argument of type '{ id?: string | undefined; reporter_id?: string | null | undefined; type?: "security" | "emergency" | "maintenance" | "lost_found" | "other" | undefined; category?: string | null | undefined; ... 12 more ...; updated_at?: string | undefined; }' is not assignable to parameter of type 'never'.
09:27:54.284 src/services/reports.service.ts(160,12): error TS2352: Conversion of type 'null' to type '{ id: string; reporter_id: string | null; type: "security" | "emergency" | "maintenance" | "lost_found" | "other"; category: string | null; title: string; description: string; location: string; ... 9 more ...; updated_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.284 src/services/reports.service.ts(204,43): error TS2339: Property 'status' does not exist on type 'never'.
09:27:54.284 src/services/reports.service.ts(205,50): error TS2339: Property 'status' does not exist on type 'never'.
09:27:54.284 src/services/reports.service.ts(206,47): error TS2339: Property 'status' does not exist on type 'never'.
09:27:54.284 src/services/reports.service.ts(209,49): error TS2339: Property 'priority' does not exist on type 'never'.
09:27:54.284 src/services/reports.service.ts(210,45): error TS2339: Property 'priority' does not exist on type 'never'.
09:27:54.284 src/services/reports.service.ts(211,47): error TS2339: Property 'priority' does not exist on type 'never'.
09:27:54.284 src/services/reports.service.ts(212,44): error TS2339: Property 'priority' does not exist on type 'never'.
09:27:54.284 src/services/reports.service.ts(215,45): error TS2339: Property 'type' does not exist on type 'never'.
09:27:54.284 src/services/reports.service.ts(216,46): error TS2339: Property 'type' does not exist on type 'never'.
09:27:54.284 src/services/reports.service.ts(217,48): error TS2339: Property 'type' does not exist on type 'never'.
09:27:54.284 src/services/reports.service.ts(218,47): error TS2339: Property 'type' does not exist on type 'never'.
09:27:54.285 src/services/reports.service.ts(219,42): error TS2339: Property 'type' does not exist on type 'never'.
09:27:54.285 src/services/tutoring.service.ts(152,12): error TS2352: Conversion of type 'null' to type 'TutoringSessionWithTutor' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.285 src/services/tutoring.service.ts(164,77): error TS2769: No overload matches this call.
09:27:54.285   Overload 1 of 2, '(values: never, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "tutoring_sessions", never, "POST">', gave the following error.
09:27:54.285     Argument of type 'Omit<{ id?: string | undefined; tutor_id: string; category_id?: string | null | undefined; subject: string; title: string; description: string; price_per_hour: number; duration_minutes: number; ... 10 more ...; updated_at?: string | undefined; }, "id" | ... 1 more ... | "updated_at">' is not assignable to parameter of type 'never'.
09:27:54.285   Overload 2 of 2, '(values: never[], options?: { count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "tutoring_sessions", never, "POST">', gave the following error.
09:27:54.285     Argument of type 'Omit<{ id?: string | undefined; tutor_id: string; category_id?: string | null | undefined; subject: string; title: string; description: string; price_per_hour: number; duration_minutes: number; ... 10 more ...; updated_at?: string | undefined; }, "id" | ... 1 more ... | "updated_at">' is not assignable to parameter of type 'never[]'.
09:27:54.285       Type 'Omit<{ id?: string | undefined; tutor_id: string; category_id?: string | null | undefined; subject: string; title: string; description: string; price_per_hour: number; duration_minutes: number; ... 10 more ...; updated_at?: string | undefined; }, "id" | ... 1 more ... | "updated_at">' is missing the following properties from type 'never[]': length, pop, push, concat, and 29 more.
09:27:54.285 src/services/tutoring.service.ts(170,12): error TS2352: Conversion of type 'null' to type '{ id: string; tutor_id: string; category_id: string | null; subject: string; title: string; description: string; price_per_hour: number; duration_minutes: number; mode: "both" | "presential" | "online"; ... 9 more ...; updated_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.285 src/services/tutoring.service.ts(180,77): error TS2345: Argument of type '{ id?: string | undefined; tutor_id?: string | undefined; category_id?: string | null | undefined; subject?: string | undefined; title?: string | undefined; description?: string | undefined; ... 12 more ...; updated_at?: string | undefined; }' is not assignable to parameter of type 'never'.
09:27:54.285 src/services/tutoring.service.ts(186,12): error TS2352: Conversion of type 'null' to type '{ id: string; tutor_id: string; category_id: string | null; subject: string; title: string; description: string; price_per_hour: number; duration_minutes: number; mode: "both" | "presential" | "online"; ... 9 more ...; updated_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.285 src/services/tutoring.service.ts(196,71): error TS2345: Argument of type '{ status: string; }' is not assignable to parameter of type 'never'.
09:27:54.285 src/services/tutoring.service.ts(214,77): error TS2769: No overload matches this call.
09:27:54.286   Overload 1 of 2, '(values: never, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "tutoring_bookings", never, "POST">', gave the following error.
09:27:54.286     Argument of type 'Omit<{ id?: string | undefined; session_id: string; tutor_id: string; student_id: string; scheduled_date: string; scheduled_time: string; duration_minutes: number; total_price: number; status?: "pending" | ... 5 more ... | undefined; ... 9 more ...; updated_at?: string | undefined; }, "id" | ... 1 more ... | "update...' is not assignable to parameter of type 'never'.
09:27:54.286   Overload 2 of 2, '(values: never[], options?: { count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "tutoring_bookings", never, "POST">', gave the following error.
09:27:54.286     Argument of type 'Omit<{ id?: string | undefined; session_id: string; tutor_id: string; student_id: string; scheduled_date: string; scheduled_time: string; duration_minutes: number; total_price: number; status?: "pending" | ... 5 more ... | undefined; ... 9 more ...; updated_at?: string | undefined; }, "id" | ... 1 more ... | "update...' is not assignable to parameter of type 'never[]'.
09:27:54.286       Type 'Omit<{ id?: string | undefined; session_id: string; tutor_id: string; student_id: string; scheduled_date: string; scheduled_time: string; duration_minutes: number; total_price: number; status?: "pending" | ... 5 more ... | undefined; ... 9 more ...; updated_at?: string | undefined; }, "id" | ... 1 more ... | "update...' is missing the following properties from type 'never[]': length, pop, push, concat, and 29 more.
09:27:54.286 src/services/tutoring.service.ts(220,12): error TS2352: Conversion of type 'null' to type '{ id: string; session_id: string; tutor_id: string; student_id: string; scheduled_date: string; scheduled_time: string; duration_minutes: number; total_price: number; status: "pending" | "completed" | "cancelled" | "confirmed" | "in_progress" | "no_show"; ... 9 more ...; updated_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.286 src/services/tutoring.service.ts(230,77): error TS2345: Argument of type '{ id?: string | undefined; session_id?: string | undefined; tutor_id?: string | undefined; student_id?: string | undefined; scheduled_date?: string | undefined; scheduled_time?: string | undefined; ... 12 more ...; updated_at?: string | undefined; }' is not assignable to parameter of type 'never'.
09:27:54.286 src/services/tutoring.service.ts(236,12): error TS2352: Conversion of type 'null' to type '{ id: string; session_id: string; tutor_id: string; student_id: string; scheduled_date: string; scheduled_time: string; duration_minutes: number; total_price: number; status: "pending" | "completed" | "cancelled" | "confirmed" | "in_progress" | "no_show"; ... 9 more ...; updated_at: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
09:27:54.286 src/services/tutoring.service.ts(349,85): error TS2339: Property 'id' does not exist on type 'never'.
09:27:54.286 src/services/tutoring.service.ts(358,58): error TS2769: No overload matches this call.
09:27:54.286   Overload 1 of 2, '(values: never, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "favorites", never, "POST">', gave the following error.
09:27:54.286     Argument of type '{ user_id: string; tutoring_session_id: string; item_type: string; }' is not assignable to parameter of type 'never'.
09:27:54.286   Overload 2 of 2, '(values: never[], options?: { count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "favorites", never, "POST">', gave the following error.
09:27:54.286     Object literal may only specify known properties, and 'user_id' does not exist in type 'never[]'.
09:27:54.584 Error: Command "npm run build" exited with 2