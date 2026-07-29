import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// DECIMAL
//------------------------------------------------------

export const DecimalJsLikeSchema: z.ZodType<Prisma.DecimalJsLike> = z.object({
  d: z.array(z.number()),
  e: z.number(),
  s: z.number(),
  toFixed: z.any(),
})

export const DECIMAL_STRING_REGEX = /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/;

export const isValidDecimalInput =
  (v?: null | string | number | Prisma.DecimalJsLike): v is string | number | Prisma.DecimalJsLike => {
    if (v === undefined || v === null) return false;
    return (
      (typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
      (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
      typeof v === 'number'
    )
  };

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','name','phone','address','role','createdAt','updatedAt']);

export const VendorScalarFieldEnumSchema = z.enum(['id','userId','businessName','businessPhone','createdAt','updatedAt']);

export const ProductScalarFieldEnumSchema = z.enum(['id','vendorId','productName','description','unit','createdAt','updatedAt']);

export const VendorCustomersScalarFieldEnumSchema = z.enum(['id','vendorId','customerId','customerPhone','createdAt','updatedAt']);

export const CustomerSubscriptionScalarFieldEnumSchema = z.enum(['id','vendorCustomerId','productId','startDate','dailyQuantity','createdAt','updatedAt']);

export const RequestsScalarFieldEnumSchema = z.enum(['id','vendorCustomerId','productId','subscriptionId','type','message','start_date','end_date','requestedQuantity','status','respondedAt','createdAt','updatedAt']);

export const PushTokenScalarFieldEnumSchema = z.enum(['id','token','platform','userId','createdAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const RoleSchema = z.enum(['CUSTOMER','VENDOR']);

export type RoleType = `${z.infer<typeof RoleSchema>}`

export const StatusSchema = z.enum(['PENDING','ACCEPTED','REJECTED']);

export type StatusType = `${z.infer<typeof StatusSchema>}`

export const ProductUnitSchema = z.enum(['PIECE','PACKET','BOTTLE','LITRE','ML','KG','GRAM','DOZEN']);

export type ProductUnitType = `${z.infer<typeof ProductUnitSchema>}`

export const RequestTypeSchema = z.enum(['NOTE','SKIP','INCREASE','DECREASE']);

export type RequestTypeType = `${z.infer<typeof RequestTypeSchema>}`

export const PlatformSchema = z.enum(['ANDROID','IOS']);

export type PlatformType = `${z.infer<typeof PlatformSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  role: RoleSchema,
  id: z.uuid(),
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  address: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// VENDOR SCHEMA
/////////////////////////////////////////

export const VendorSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  businessName: z.string().min(2,{message: "Business name must be at least 2 characters long"}),
  businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Vendor = z.infer<typeof VendorSchema>

/////////////////////////////////////////
// PRODUCT SCHEMA
/////////////////////////////////////////

export const ProductSchema = z.object({
  unit: ProductUnitSchema,
  id: z.uuid(),
  vendorId: z.string(),
  productName: z.string().min(2,{message: "Product name must be of at least 2 characters"}),
  description: z.string().min(2, {message: "Product description must be of at leat 2 characters"}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Product = z.infer<typeof ProductSchema>

/////////////////////////////////////////
// VENDOR CUSTOMERS SCHEMA
/////////////////////////////////////////

export const VendorCustomersSchema = z.object({
  id: z.uuid(),
  vendorId: z.string(),
  customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  customerPhone: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type VendorCustomers = z.infer<typeof VendorCustomersSchema>

/////////////////////////////////////////
// CUSTOMER SUBSCRIPTION SCHEMA
/////////////////////////////////////////

export const CustomerSubscriptionSchema = z.object({
  id: z.uuid(),
  vendorCustomerId: z.string(),
  productId: z.string(),
  startDate: z.coerce.date(),
  dailyQuantity: z.instanceof(Prisma.Decimal, { message: "Field 'dailyQuantity' must be a Decimal. Location: ['Models', 'CustomerSubscription']"}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CustomerSubscription = z.infer<typeof CustomerSubscriptionSchema>

/////////////////////////////////////////
// REQUESTS SCHEMA
/////////////////////////////////////////

export const RequestsSchema = z.object({
  type: RequestTypeSchema,
  status: StatusSchema,
  id: z.uuid(),
  vendorCustomerId: z.string(),
  productId: z.string(),
  subscriptionId: z.string(),
  message: z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  requestedQuantity: z.instanceof(Prisma.Decimal, { message: "Field 'requestedQuantity' must be a Decimal. Location: ['Models', 'Requests']"}).nullable(),
  respondedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Requests = z.infer<typeof RequestsSchema>

/////////////////////////////////////////
// PUSH TOKEN SCHEMA
/////////////////////////////////////////

export const PushTokenSchema = z.object({
  platform: PlatformSchema,
  id: z.cuid(),
  token: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date(),
})

export type PushToken = z.infer<typeof PushTokenSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  vendor: z.union([z.boolean(),z.lazy(() => VendorArgsSchema)]).optional(),
  vendorcustomers: z.union([z.boolean(),z.lazy(() => VendorCustomersFindManyArgsSchema)]).optional(),
  pushToken: z.union([z.boolean(),z.lazy(() => PushTokenFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  vendorcustomers: z.boolean().optional(),
  pushToken: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  phone: z.boolean().optional(),
  address: z.boolean().optional(),
  role: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  vendor: z.union([z.boolean(),z.lazy(() => VendorArgsSchema)]).optional(),
  vendorcustomers: z.union([z.boolean(),z.lazy(() => VendorCustomersFindManyArgsSchema)]).optional(),
  pushToken: z.union([z.boolean(),z.lazy(() => PushTokenFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// VENDOR
//------------------------------------------------------

export const VendorIncludeSchema: z.ZodType<Prisma.VendorInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  vendorcustomers: z.union([z.boolean(),z.lazy(() => VendorCustomersFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => VendorCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const VendorArgsSchema: z.ZodType<Prisma.VendorDefaultArgs> = z.object({
  select: z.lazy(() => VendorSelectSchema).optional(),
  include: z.lazy(() => VendorIncludeSchema).optional(),
}).strict();

export const VendorCountOutputTypeArgsSchema: z.ZodType<Prisma.VendorCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => VendorCountOutputTypeSelectSchema).nullish(),
}).strict();

export const VendorCountOutputTypeSelectSchema: z.ZodType<Prisma.VendorCountOutputTypeSelect> = z.object({
  product: z.boolean().optional(),
  vendorcustomers: z.boolean().optional(),
}).strict();

export const VendorSelectSchema: z.ZodType<Prisma.VendorSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  businessName: z.boolean().optional(),
  businessPhone: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  vendorcustomers: z.union([z.boolean(),z.lazy(() => VendorCustomersFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => VendorCountOutputTypeArgsSchema)]).optional(),
}).strict()

// PRODUCT
//------------------------------------------------------

export const ProductIncludeSchema: z.ZodType<Prisma.ProductInclude> = z.object({
  vendor: z.union([z.boolean(),z.lazy(() => VendorArgsSchema)]).optional(),
  subscription: z.union([z.boolean(),z.lazy(() => CustomerSubscriptionFindManyArgsSchema)]).optional(),
  request: z.union([z.boolean(),z.lazy(() => RequestsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const ProductArgsSchema: z.ZodType<Prisma.ProductDefaultArgs> = z.object({
  select: z.lazy(() => ProductSelectSchema).optional(),
  include: z.lazy(() => ProductIncludeSchema).optional(),
}).strict();

export const ProductCountOutputTypeArgsSchema: z.ZodType<Prisma.ProductCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ProductCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ProductCountOutputTypeSelectSchema: z.ZodType<Prisma.ProductCountOutputTypeSelect> = z.object({
  subscription: z.boolean().optional(),
  request: z.boolean().optional(),
}).strict();

export const ProductSelectSchema: z.ZodType<Prisma.ProductSelect> = z.object({
  id: z.boolean().optional(),
  vendorId: z.boolean().optional(),
  productName: z.boolean().optional(),
  description: z.boolean().optional(),
  unit: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  vendor: z.union([z.boolean(),z.lazy(() => VendorArgsSchema)]).optional(),
  subscription: z.union([z.boolean(),z.lazy(() => CustomerSubscriptionFindManyArgsSchema)]).optional(),
  request: z.union([z.boolean(),z.lazy(() => RequestsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductCountOutputTypeArgsSchema)]).optional(),
}).strict()

// VENDOR CUSTOMERS
//------------------------------------------------------

export const VendorCustomersIncludeSchema: z.ZodType<Prisma.VendorCustomersInclude> = z.object({
  vendor: z.union([z.boolean(),z.lazy(() => VendorArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  subscription: z.union([z.boolean(),z.lazy(() => CustomerSubscriptionFindManyArgsSchema)]).optional(),
  request: z.union([z.boolean(),z.lazy(() => RequestsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => VendorCustomersCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const VendorCustomersArgsSchema: z.ZodType<Prisma.VendorCustomersDefaultArgs> = z.object({
  select: z.lazy(() => VendorCustomersSelectSchema).optional(),
  include: z.lazy(() => VendorCustomersIncludeSchema).optional(),
}).strict();

export const VendorCustomersCountOutputTypeArgsSchema: z.ZodType<Prisma.VendorCustomersCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => VendorCustomersCountOutputTypeSelectSchema).nullish(),
}).strict();

export const VendorCustomersCountOutputTypeSelectSchema: z.ZodType<Prisma.VendorCustomersCountOutputTypeSelect> = z.object({
  subscription: z.boolean().optional(),
  request: z.boolean().optional(),
}).strict();

export const VendorCustomersSelectSchema: z.ZodType<Prisma.VendorCustomersSelect> = z.object({
  id: z.boolean().optional(),
  vendorId: z.boolean().optional(),
  customerId: z.boolean().optional(),
  customerPhone: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  vendor: z.union([z.boolean(),z.lazy(() => VendorArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  subscription: z.union([z.boolean(),z.lazy(() => CustomerSubscriptionFindManyArgsSchema)]).optional(),
  request: z.union([z.boolean(),z.lazy(() => RequestsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => VendorCustomersCountOutputTypeArgsSchema)]).optional(),
}).strict()

// CUSTOMER SUBSCRIPTION
//------------------------------------------------------

export const CustomerSubscriptionIncludeSchema: z.ZodType<Prisma.CustomerSubscriptionInclude> = z.object({
  vendorCustomers: z.union([z.boolean(),z.lazy(() => VendorCustomersArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  requests: z.union([z.boolean(),z.lazy(() => RequestsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CustomerSubscriptionCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const CustomerSubscriptionArgsSchema: z.ZodType<Prisma.CustomerSubscriptionDefaultArgs> = z.object({
  select: z.lazy(() => CustomerSubscriptionSelectSchema).optional(),
  include: z.lazy(() => CustomerSubscriptionIncludeSchema).optional(),
}).strict();

export const CustomerSubscriptionCountOutputTypeArgsSchema: z.ZodType<Prisma.CustomerSubscriptionCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => CustomerSubscriptionCountOutputTypeSelectSchema).nullish(),
}).strict();

export const CustomerSubscriptionCountOutputTypeSelectSchema: z.ZodType<Prisma.CustomerSubscriptionCountOutputTypeSelect> = z.object({
  requests: z.boolean().optional(),
}).strict();

export const CustomerSubscriptionSelectSchema: z.ZodType<Prisma.CustomerSubscriptionSelect> = z.object({
  id: z.boolean().optional(),
  vendorCustomerId: z.boolean().optional(),
  productId: z.boolean().optional(),
  startDate: z.boolean().optional(),
  dailyQuantity: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  vendorCustomers: z.union([z.boolean(),z.lazy(() => VendorCustomersArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  requests: z.union([z.boolean(),z.lazy(() => RequestsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CustomerSubscriptionCountOutputTypeArgsSchema)]).optional(),
}).strict()

// REQUESTS
//------------------------------------------------------

export const RequestsIncludeSchema: z.ZodType<Prisma.RequestsInclude> = z.object({
  vendorCustomers: z.union([z.boolean(),z.lazy(() => VendorCustomersArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  subscription: z.union([z.boolean(),z.lazy(() => CustomerSubscriptionArgsSchema)]).optional(),
}).strict();

export const RequestsArgsSchema: z.ZodType<Prisma.RequestsDefaultArgs> = z.object({
  select: z.lazy(() => RequestsSelectSchema).optional(),
  include: z.lazy(() => RequestsIncludeSchema).optional(),
}).strict();

export const RequestsSelectSchema: z.ZodType<Prisma.RequestsSelect> = z.object({
  id: z.boolean().optional(),
  vendorCustomerId: z.boolean().optional(),
  productId: z.boolean().optional(),
  subscriptionId: z.boolean().optional(),
  type: z.boolean().optional(),
  message: z.boolean().optional(),
  start_date: z.boolean().optional(),
  end_date: z.boolean().optional(),
  requestedQuantity: z.boolean().optional(),
  status: z.boolean().optional(),
  respondedAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  vendorCustomers: z.union([z.boolean(),z.lazy(() => VendorCustomersArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  subscription: z.union([z.boolean(),z.lazy(() => CustomerSubscriptionArgsSchema)]).optional(),
}).strict()

// PUSH TOKEN
//------------------------------------------------------

export const PushTokenIncludeSchema: z.ZodType<Prisma.PushTokenInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const PushTokenArgsSchema: z.ZodType<Prisma.PushTokenDefaultArgs> = z.object({
  select: z.lazy(() => PushTokenSelectSchema).optional(),
  include: z.lazy(() => PushTokenIncludeSchema).optional(),
}).strict();

export const PushTokenSelectSchema: z.ZodType<Prisma.PushTokenSelect> = z.object({
  id: z.boolean().optional(),
  token: z.boolean().optional(),
  platform: z.boolean().optional(),
  userId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  phone: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  address: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleFilterSchema), z.lazy(() => RoleSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  vendor: z.union([ z.lazy(() => VendorNullableScalarRelationFilterSchema), z.lazy(() => VendorWhereInputSchema) ]).optional().nullable(),
  vendorcustomers: z.lazy(() => VendorCustomersListRelationFilterSchema).optional(),
  pushToken: z.lazy(() => PushTokenListRelationFilterSchema).optional(),
});

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  vendor: z.lazy(() => VendorOrderByWithRelationInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersOrderByRelationAggregateInputSchema).optional(),
  pushToken: z.lazy(() => PushTokenOrderByRelationAggregateInputSchema).optional(),
});

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }).optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string().min(2, { message: "Name must be at least 2 characters long" }) ]).optional(),
  address: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleFilterSchema), z.lazy(() => RoleSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  vendor: z.union([ z.lazy(() => VendorNullableScalarRelationFilterSchema), z.lazy(() => VendorWhereInputSchema) ]).optional().nullable(),
  vendorcustomers: z.lazy(() => VendorCustomersListRelationFilterSchema).optional(),
  pushToken: z.lazy(() => PushTokenListRelationFilterSchema).optional(),
}));

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
});

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  phone: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  address: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleWithAggregatesFilterSchema), z.lazy(() => RoleSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const VendorWhereInputSchema: z.ZodType<Prisma.VendorWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => VendorWhereInputSchema), z.lazy(() => VendorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VendorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VendorWhereInputSchema), z.lazy(() => VendorWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  businessName: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  businessPhone: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  product: z.lazy(() => ProductListRelationFilterSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersListRelationFilterSchema).optional(),
});

export const VendorOrderByWithRelationInputSchema: z.ZodType<Prisma.VendorOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  businessName: z.lazy(() => SortOrderSchema).optional(),
  businessPhone: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  product: z.lazy(() => ProductOrderByRelationAggregateInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersOrderByRelationAggregateInputSchema).optional(),
});

export const VendorWhereUniqueInputSchema: z.ZodType<Prisma.VendorWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    userId: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    userId: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  userId: z.string().optional(),
  AND: z.union([ z.lazy(() => VendorWhereInputSchema), z.lazy(() => VendorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VendorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VendorWhereInputSchema), z.lazy(() => VendorWhereInputSchema).array() ]).optional(),
  businessName: z.union([ z.lazy(() => StringFilterSchema), z.string().min(2,{message: "Business name must be at least 2 characters long"}) ]).optional(),
  businessPhone: z.union([ z.lazy(() => StringFilterSchema), z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  product: z.lazy(() => ProductListRelationFilterSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersListRelationFilterSchema).optional(),
}));

export const VendorOrderByWithAggregationInputSchema: z.ZodType<Prisma.VendorOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  businessName: z.lazy(() => SortOrderSchema).optional(),
  businessPhone: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => VendorCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => VendorMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => VendorMinOrderByAggregateInputSchema).optional(),
});

export const VendorScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.VendorScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => VendorScalarWhereWithAggregatesInputSchema), z.lazy(() => VendorScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => VendorScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VendorScalarWhereWithAggregatesInputSchema), z.lazy(() => VendorScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  businessName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  businessPhone: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const ProductWhereInputSchema: z.ZodType<Prisma.ProductWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  vendorId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productName: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  unit: z.union([ z.lazy(() => EnumProductUnitFilterSchema), z.lazy(() => ProductUnitSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  vendor: z.union([ z.lazy(() => VendorScalarRelationFilterSchema), z.lazy(() => VendorWhereInputSchema) ]).optional(),
  subscription: z.lazy(() => CustomerSubscriptionListRelationFilterSchema).optional(),
  request: z.lazy(() => RequestsListRelationFilterSchema).optional(),
});

export const ProductOrderByWithRelationInputSchema: z.ZodType<Prisma.ProductOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.lazy(() => SortOrderSchema).optional(),
  productName: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  unit: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  vendor: z.lazy(() => VendorOrderByWithRelationInputSchema).optional(),
  subscription: z.lazy(() => CustomerSubscriptionOrderByRelationAggregateInputSchema).optional(),
  request: z.lazy(() => RequestsOrderByRelationAggregateInputSchema).optional(),
});

export const ProductWhereUniqueInputSchema: z.ZodType<Prisma.ProductWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  vendorId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productName: z.union([ z.lazy(() => StringFilterSchema), z.string().min(2,{message: "Product name must be of at least 2 characters"}) ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema), z.string().min(2, {message: "Product description must be of at leat 2 characters"}) ]).optional(),
  unit: z.union([ z.lazy(() => EnumProductUnitFilterSchema), z.lazy(() => ProductUnitSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  vendor: z.union([ z.lazy(() => VendorScalarRelationFilterSchema), z.lazy(() => VendorWhereInputSchema) ]).optional(),
  subscription: z.lazy(() => CustomerSubscriptionListRelationFilterSchema).optional(),
  request: z.lazy(() => RequestsListRelationFilterSchema).optional(),
}));

export const ProductOrderByWithAggregationInputSchema: z.ZodType<Prisma.ProductOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.lazy(() => SortOrderSchema).optional(),
  productName: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  unit: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ProductCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ProductMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ProductMinOrderByAggregateInputSchema).optional(),
});

export const ProductScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ProductScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductScalarWhereWithAggregatesInputSchema), z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductScalarWhereWithAggregatesInputSchema), z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  vendorId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  productName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  unit: z.union([ z.lazy(() => EnumProductUnitWithAggregatesFilterSchema), z.lazy(() => ProductUnitSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const VendorCustomersWhereInputSchema: z.ZodType<Prisma.VendorCustomersWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => VendorCustomersWhereInputSchema), z.lazy(() => VendorCustomersWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VendorCustomersWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VendorCustomersWhereInputSchema), z.lazy(() => VendorCustomersWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  vendorId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  customerId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  customerPhone: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  vendor: z.union([ z.lazy(() => VendorScalarRelationFilterSchema), z.lazy(() => VendorWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  subscription: z.lazy(() => CustomerSubscriptionListRelationFilterSchema).optional(),
  request: z.lazy(() => RequestsListRelationFilterSchema).optional(),
});

export const VendorCustomersOrderByWithRelationInputSchema: z.ZodType<Prisma.VendorCustomersOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.lazy(() => SortOrderSchema).optional(),
  customerId: z.lazy(() => SortOrderSchema).optional(),
  customerPhone: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  vendor: z.lazy(() => VendorOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  subscription: z.lazy(() => CustomerSubscriptionOrderByRelationAggregateInputSchema).optional(),
  request: z.lazy(() => RequestsOrderByRelationAggregateInputSchema).optional(),
});

export const VendorCustomersWhereUniqueInputSchema: z.ZodType<Prisma.VendorCustomersWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    vendorId_customerId: z.lazy(() => VendorCustomersVendorIdCustomerIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    vendorId_customerId: z.lazy(() => VendorCustomersVendorIdCustomerIdCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  vendorId_customerId: z.lazy(() => VendorCustomersVendorIdCustomerIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => VendorCustomersWhereInputSchema), z.lazy(() => VendorCustomersWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VendorCustomersWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VendorCustomersWhereInputSchema), z.lazy(() => VendorCustomersWhereInputSchema).array() ]).optional(),
  vendorId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  customerId: z.union([ z.lazy(() => StringFilterSchema), z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }) ]).optional(),
  customerPhone: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  vendor: z.union([ z.lazy(() => VendorScalarRelationFilterSchema), z.lazy(() => VendorWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  subscription: z.lazy(() => CustomerSubscriptionListRelationFilterSchema).optional(),
  request: z.lazy(() => RequestsListRelationFilterSchema).optional(),
}));

export const VendorCustomersOrderByWithAggregationInputSchema: z.ZodType<Prisma.VendorCustomersOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.lazy(() => SortOrderSchema).optional(),
  customerId: z.lazy(() => SortOrderSchema).optional(),
  customerPhone: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => VendorCustomersCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => VendorCustomersMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => VendorCustomersMinOrderByAggregateInputSchema).optional(),
});

export const VendorCustomersScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.VendorCustomersScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => VendorCustomersScalarWhereWithAggregatesInputSchema), z.lazy(() => VendorCustomersScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => VendorCustomersScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VendorCustomersScalarWhereWithAggregatesInputSchema), z.lazy(() => VendorCustomersScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  vendorId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  customerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  customerPhone: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const CustomerSubscriptionWhereInputSchema: z.ZodType<Prisma.CustomerSubscriptionWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CustomerSubscriptionWhereInputSchema), z.lazy(() => CustomerSubscriptionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CustomerSubscriptionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CustomerSubscriptionWhereInputSchema), z.lazy(() => CustomerSubscriptionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  vendorCustomerId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  startDate: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  dailyQuantity: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  vendorCustomers: z.union([ z.lazy(() => VendorCustomersScalarRelationFilterSchema), z.lazy(() => VendorCustomersWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema) ]).optional(),
  requests: z.lazy(() => RequestsListRelationFilterSchema).optional(),
});

export const CustomerSubscriptionOrderByWithRelationInputSchema: z.ZodType<Prisma.CustomerSubscriptionOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  dailyQuantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  vendorCustomers: z.lazy(() => VendorCustomersOrderByWithRelationInputSchema).optional(),
  product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
  requests: z.lazy(() => RequestsOrderByRelationAggregateInputSchema).optional(),
});

export const CustomerSubscriptionWhereUniqueInputSchema: z.ZodType<Prisma.CustomerSubscriptionWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    vendorCustomerId_productId: z.lazy(() => CustomerSubscriptionVendorCustomerIdProductIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    vendorCustomerId_productId: z.lazy(() => CustomerSubscriptionVendorCustomerIdProductIdCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  vendorCustomerId_productId: z.lazy(() => CustomerSubscriptionVendorCustomerIdProductIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => CustomerSubscriptionWhereInputSchema), z.lazy(() => CustomerSubscriptionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CustomerSubscriptionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CustomerSubscriptionWhereInputSchema), z.lazy(() => CustomerSubscriptionWhereInputSchema).array() ]).optional(),
  vendorCustomerId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  startDate: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  dailyQuantity: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  vendorCustomers: z.union([ z.lazy(() => VendorCustomersScalarRelationFilterSchema), z.lazy(() => VendorCustomersWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema) ]).optional(),
  requests: z.lazy(() => RequestsListRelationFilterSchema).optional(),
}));

export const CustomerSubscriptionOrderByWithAggregationInputSchema: z.ZodType<Prisma.CustomerSubscriptionOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  dailyQuantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CustomerSubscriptionCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => CustomerSubscriptionAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CustomerSubscriptionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CustomerSubscriptionMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => CustomerSubscriptionSumOrderByAggregateInputSchema).optional(),
});

export const CustomerSubscriptionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CustomerSubscriptionScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CustomerSubscriptionScalarWhereWithAggregatesInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CustomerSubscriptionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CustomerSubscriptionScalarWhereWithAggregatesInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  vendorCustomerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  startDate: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  dailyQuantity: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const RequestsWhereInputSchema: z.ZodType<Prisma.RequestsWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => RequestsWhereInputSchema), z.lazy(() => RequestsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RequestsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RequestsWhereInputSchema), z.lazy(() => RequestsWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  vendorCustomerId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  subscriptionId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumRequestTypeFilterSchema), z.lazy(() => RequestTypeSchema) ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  start_date: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  end_date: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  requestedQuantity: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumStatusFilterSchema), z.lazy(() => StatusSchema) ]).optional(),
  respondedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  vendorCustomers: z.union([ z.lazy(() => VendorCustomersScalarRelationFilterSchema), z.lazy(() => VendorCustomersWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema) ]).optional(),
  subscription: z.union([ z.lazy(() => CustomerSubscriptionScalarRelationFilterSchema), z.lazy(() => CustomerSubscriptionWhereInputSchema) ]).optional(),
});

export const RequestsOrderByWithRelationInputSchema: z.ZodType<Prisma.RequestsOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  subscriptionId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  start_date: z.lazy(() => SortOrderSchema).optional(),
  end_date: z.lazy(() => SortOrderSchema).optional(),
  requestedQuantity: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  respondedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  vendorCustomers: z.lazy(() => VendorCustomersOrderByWithRelationInputSchema).optional(),
  product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
  subscription: z.lazy(() => CustomerSubscriptionOrderByWithRelationInputSchema).optional(),
});

export const RequestsWhereUniqueInputSchema: z.ZodType<Prisma.RequestsWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => RequestsWhereInputSchema), z.lazy(() => RequestsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RequestsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RequestsWhereInputSchema), z.lazy(() => RequestsWhereInputSchema).array() ]).optional(),
  vendorCustomerId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  subscriptionId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumRequestTypeFilterSchema), z.lazy(() => RequestTypeSchema) ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string().min(2,{message: "Message should be at least 2 of 2 characters"}) ]).optional(),
  start_date: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  end_date: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  requestedQuantity: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumStatusFilterSchema), z.lazy(() => StatusSchema) ]).optional(),
  respondedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  vendorCustomers: z.union([ z.lazy(() => VendorCustomersScalarRelationFilterSchema), z.lazy(() => VendorCustomersWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema) ]).optional(),
  subscription: z.union([ z.lazy(() => CustomerSubscriptionScalarRelationFilterSchema), z.lazy(() => CustomerSubscriptionWhereInputSchema) ]).optional(),
}));

export const RequestsOrderByWithAggregationInputSchema: z.ZodType<Prisma.RequestsOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  subscriptionId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  start_date: z.lazy(() => SortOrderSchema).optional(),
  end_date: z.lazy(() => SortOrderSchema).optional(),
  requestedQuantity: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  respondedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => RequestsCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => RequestsAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => RequestsMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => RequestsMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => RequestsSumOrderByAggregateInputSchema).optional(),
});

export const RequestsScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.RequestsScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => RequestsScalarWhereWithAggregatesInputSchema), z.lazy(() => RequestsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => RequestsScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RequestsScalarWhereWithAggregatesInputSchema), z.lazy(() => RequestsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  vendorCustomerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  subscriptionId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumRequestTypeWithAggregatesFilterSchema), z.lazy(() => RequestTypeSchema) ]).optional(),
  message: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  start_date: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  end_date: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  requestedQuantity: z.union([ z.lazy(() => DecimalNullableWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumStatusWithAggregatesFilterSchema), z.lazy(() => StatusSchema) ]).optional(),
  respondedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const PushTokenWhereInputSchema: z.ZodType<Prisma.PushTokenWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => PushTokenWhereInputSchema), z.lazy(() => PushTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PushTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PushTokenWhereInputSchema), z.lazy(() => PushTokenWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  platform: z.union([ z.lazy(() => EnumPlatformFilterSchema), z.lazy(() => PlatformSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
});

export const PushTokenOrderByWithRelationInputSchema: z.ZodType<Prisma.PushTokenOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  platform: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});

export const PushTokenWhereUniqueInputSchema: z.ZodType<Prisma.PushTokenWhereUniqueInput> = z.union([
  z.object({
    id: z.cuid(),
    token: z.string(),
  }),
  z.object({
    id: z.cuid(),
  }),
  z.object({
    token: z.string(),
  }),
])
.and(z.strictObject({
  id: z.cuid().optional(),
  token: z.string().optional(),
  AND: z.union([ z.lazy(() => PushTokenWhereInputSchema), z.lazy(() => PushTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PushTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PushTokenWhereInputSchema), z.lazy(() => PushTokenWhereInputSchema).array() ]).optional(),
  platform: z.union([ z.lazy(() => EnumPlatformFilterSchema), z.lazy(() => PlatformSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
}));

export const PushTokenOrderByWithAggregationInputSchema: z.ZodType<Prisma.PushTokenOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  platform: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => PushTokenCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => PushTokenMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => PushTokenMinOrderByAggregateInputSchema).optional(),
});

export const PushTokenScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PushTokenScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => PushTokenScalarWhereWithAggregatesInputSchema), z.lazy(() => PushTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PushTokenScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PushTokenScalarWhereWithAggregatesInputSchema), z.lazy(() => PushTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  platform: z.union([ z.lazy(() => EnumPlatformWithAggregatesFilterSchema), z.lazy(() => PlatformSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  address: z.string(),
  role: z.lazy(() => RoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendor: z.lazy(() => VendorCreateNestedOneWithoutUserInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersCreateNestedManyWithoutUserInputSchema).optional(),
  pushToken: z.lazy(() => PushTokenCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  address: z.string(),
  role: z.lazy(() => RoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendor: z.lazy(() => VendorUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pushToken: z.lazy(() => PushTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(2, { message: "Name must be at least 2 characters long" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendor: z.lazy(() => VendorUpdateOneWithoutUserNestedInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUpdateManyWithoutUserNestedInputSchema).optional(),
  pushToken: z.lazy(() => PushTokenUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(2, { message: "Name must be at least 2 characters long" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendor: z.lazy(() => VendorUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pushToken: z.lazy(() => PushTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  address: z.string(),
  role: z.lazy(() => RoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(2, { message: "Name must be at least 2 characters long" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(2, { message: "Name must be at least 2 characters long" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const VendorCreateInputSchema: z.ZodType<Prisma.VendorCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  businessName: z.string().min(2,{message: "Business name must be at least 2 characters long"}),
  businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutVendorInputSchema),
  product: z.lazy(() => ProductCreateNestedManyWithoutVendorInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersCreateNestedManyWithoutVendorInputSchema).optional(),
});

export const VendorUncheckedCreateInputSchema: z.ZodType<Prisma.VendorUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  businessName: z.string().min(2,{message: "Business name must be at least 2 characters long"}),
  businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  product: z.lazy(() => ProductUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
});

export const VendorUpdateInputSchema: z.ZodType<Prisma.VendorUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessName: z.union([ z.string().min(2,{message: "Business name must be at least 2 characters long"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessPhone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutVendorNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateManyWithoutVendorNestedInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUpdateManyWithoutVendorNestedInputSchema).optional(),
});

export const VendorUncheckedUpdateInputSchema: z.ZodType<Prisma.VendorUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessName: z.union([ z.string().min(2,{message: "Business name must be at least 2 characters long"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessPhone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
});

export const VendorCreateManyInputSchema: z.ZodType<Prisma.VendorCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  businessName: z.string().min(2,{message: "Business name must be at least 2 characters long"}),
  businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const VendorUpdateManyMutationInputSchema: z.ZodType<Prisma.VendorUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessName: z.union([ z.string().min(2,{message: "Business name must be at least 2 characters long"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessPhone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const VendorUncheckedUpdateManyInputSchema: z.ZodType<Prisma.VendorUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessName: z.union([ z.string().min(2,{message: "Business name must be at least 2 characters long"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessPhone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const ProductCreateInputSchema: z.ZodType<Prisma.ProductCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  productName: z.string().min(2,{message: "Product name must be of at least 2 characters"}),
  description: z.string().min(2, {message: "Product description must be of at leat 2 characters"}),
  unit: z.lazy(() => ProductUnitSchema),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendor: z.lazy(() => VendorCreateNestedOneWithoutProductInputSchema),
  subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutProductInputSchema).optional(),
  request: z.lazy(() => RequestsCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateInputSchema: z.ZodType<Prisma.ProductUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorId: z.string(),
  productName: z.string().min(2,{message: "Product name must be of at least 2 characters"}),
  description: z.string().min(2, {message: "Product description must be of at leat 2 characters"}),
  unit: z.lazy(() => ProductUnitSchema),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUpdateInputSchema: z.ZodType<Prisma.ProductUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string().min(2,{message: "Product name must be of at least 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string().min(2, {message: "Product description must be of at leat 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendor: z.lazy(() => VendorUpdateOneRequiredWithoutProductNestedInputSchema).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutProductNestedInputSchema).optional(),
  request: z.lazy(() => RequestsUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string().min(2,{message: "Product name must be of at least 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string().min(2, {message: "Product description must be of at leat 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  request: z.lazy(() => RequestsUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductCreateManyInputSchema: z.ZodType<Prisma.ProductCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorId: z.string(),
  productName: z.string().min(2,{message: "Product name must be of at least 2 characters"}),
  description: z.string().min(2, {message: "Product description must be of at leat 2 characters"}),
  unit: z.lazy(() => ProductUnitSchema),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const ProductUpdateManyMutationInputSchema: z.ZodType<Prisma.ProductUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string().min(2,{message: "Product name must be of at least 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string().min(2, {message: "Product description must be of at leat 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const ProductUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string().min(2,{message: "Product name must be of at least 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string().min(2, {message: "Product description must be of at leat 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const VendorCustomersCreateInputSchema: z.ZodType<Prisma.VendorCustomersCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  customerPhone: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendor: z.lazy(() => VendorCreateNestedOneWithoutVendorcustomersInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutVendorcustomersInputSchema),
  subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
  request: z.lazy(() => RequestsCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});

export const VendorCustomersUncheckedCreateInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorId: z.string(),
  customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  customerPhone: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
  request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});

export const VendorCustomersUpdateInputSchema: z.ZodType<Prisma.VendorCustomersUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendor: z.lazy(() => VendorUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
  request: z.lazy(() => RequestsUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});

export const VendorCustomersUncheckedUpdateInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
  request: z.lazy(() => RequestsUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});

export const VendorCustomersCreateManyInputSchema: z.ZodType<Prisma.VendorCustomersCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorId: z.string(),
  customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  customerPhone: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const VendorCustomersUpdateManyMutationInputSchema: z.ZodType<Prisma.VendorCustomersUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const VendorCustomersUncheckedUpdateManyInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CustomerSubscriptionCreateInputSchema: z.ZodType<Prisma.CustomerSubscriptionCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  startDate: z.coerce.date(),
  dailyQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendorCustomers: z.lazy(() => VendorCustomersCreateNestedOneWithoutSubscriptionInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutSubscriptionInputSchema),
  requests: z.lazy(() => RequestsCreateNestedManyWithoutSubscriptionInputSchema).optional(),
});

export const CustomerSubscriptionUncheckedCreateInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorCustomerId: z.string(),
  productId: z.string(),
  startDate: z.coerce.date(),
  dailyQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  requests: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutSubscriptionInputSchema).optional(),
});

export const CustomerSubscriptionUpdateInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  dailyQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomers: z.lazy(() => VendorCustomersUpdateOneRequiredWithoutSubscriptionNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutSubscriptionNestedInputSchema).optional(),
  requests: z.lazy(() => RequestsUpdateManyWithoutSubscriptionNestedInputSchema).optional(),
});

export const CustomerSubscriptionUncheckedUpdateInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  dailyQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requests: z.lazy(() => RequestsUncheckedUpdateManyWithoutSubscriptionNestedInputSchema).optional(),
});

export const CustomerSubscriptionCreateManyInputSchema: z.ZodType<Prisma.CustomerSubscriptionCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorCustomerId: z.string(),
  productId: z.string(),
  startDate: z.coerce.date(),
  dailyQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CustomerSubscriptionUpdateManyMutationInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  dailyQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CustomerSubscriptionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  dailyQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const RequestsCreateInputSchema: z.ZodType<Prisma.RequestsCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => RequestTypeSchema).optional(),
  message: z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  requestedQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  status: z.lazy(() => StatusSchema).optional(),
  respondedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendorCustomers: z.lazy(() => VendorCustomersCreateNestedOneWithoutRequestInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutRequestInputSchema),
  subscription: z.lazy(() => CustomerSubscriptionCreateNestedOneWithoutRequestsInputSchema),
});

export const RequestsUncheckedCreateInputSchema: z.ZodType<Prisma.RequestsUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorCustomerId: z.string(),
  productId: z.string(),
  subscriptionId: z.string(),
  type: z.lazy(() => RequestTypeSchema).optional(),
  message: z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  requestedQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  status: z.lazy(() => StatusSchema).optional(),
  respondedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const RequestsUpdateInputSchema: z.ZodType<Prisma.RequestsUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  start_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  end_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requestedQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  respondedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomers: z.lazy(() => VendorCustomersUpdateOneRequiredWithoutRequestNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutRequestNestedInputSchema).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUpdateOneRequiredWithoutRequestsNestedInputSchema).optional(),
});

export const RequestsUncheckedUpdateInputSchema: z.ZodType<Prisma.RequestsUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  start_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  end_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requestedQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  respondedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const RequestsCreateManyInputSchema: z.ZodType<Prisma.RequestsCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorCustomerId: z.string(),
  productId: z.string(),
  subscriptionId: z.string(),
  type: z.lazy(() => RequestTypeSchema).optional(),
  message: z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  requestedQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  status: z.lazy(() => StatusSchema).optional(),
  respondedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const RequestsUpdateManyMutationInputSchema: z.ZodType<Prisma.RequestsUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  start_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  end_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requestedQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  respondedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const RequestsUncheckedUpdateManyInputSchema: z.ZodType<Prisma.RequestsUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  start_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  end_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requestedQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  respondedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PushTokenCreateInputSchema: z.ZodType<Prisma.PushTokenCreateInput> = z.strictObject({
  id: z.cuid().optional(),
  token: z.string(),
  platform: z.lazy(() => PlatformSchema),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutPushTokenInputSchema),
});

export const PushTokenUncheckedCreateInputSchema: z.ZodType<Prisma.PushTokenUncheckedCreateInput> = z.strictObject({
  id: z.cuid().optional(),
  token: z.string(),
  platform: z.lazy(() => PlatformSchema),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const PushTokenUpdateInputSchema: z.ZodType<Prisma.PushTokenUpdateInput> = z.strictObject({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  platform: z.union([ z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutPushTokenNestedInputSchema).optional(),
});

export const PushTokenUncheckedUpdateInputSchema: z.ZodType<Prisma.PushTokenUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  platform: z.union([ z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PushTokenCreateManyInputSchema: z.ZodType<Prisma.PushTokenCreateManyInput> = z.strictObject({
  id: z.cuid().optional(),
  token: z.string(),
  platform: z.lazy(() => PlatformSchema),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const PushTokenUpdateManyMutationInputSchema: z.ZodType<Prisma.PushTokenUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  platform: z.union([ z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PushTokenUncheckedUpdateManyInputSchema: z.ZodType<Prisma.PushTokenUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  platform: z.union([ z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
});

export const EnumRoleFilterSchema: z.ZodType<Prisma.EnumRoleFilter> = z.strictObject({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema), z.lazy(() => NestedEnumRoleFilterSchema) ]).optional(),
});

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
});

export const VendorNullableScalarRelationFilterSchema: z.ZodType<Prisma.VendorNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => VendorWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => VendorWhereInputSchema).optional().nullable(),
});

export const VendorCustomersListRelationFilterSchema: z.ZodType<Prisma.VendorCustomersListRelationFilter> = z.strictObject({
  every: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
  some: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
  none: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
});

export const PushTokenListRelationFilterSchema: z.ZodType<Prisma.PushTokenListRelationFilter> = z.strictObject({
  every: z.lazy(() => PushTokenWhereInputSchema).optional(),
  some: z.lazy(() => PushTokenWhereInputSchema).optional(),
  none: z.lazy(() => PushTokenWhereInputSchema).optional(),
});

export const VendorCustomersOrderByRelationAggregateInputSchema: z.ZodType<Prisma.VendorCustomersOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const PushTokenOrderByRelationAggregateInputSchema: z.ZodType<Prisma.PushTokenOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const EnumRoleWithAggregatesFilterSchema: z.ZodType<Prisma.EnumRoleWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema), z.lazy(() => NestedEnumRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
});

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
});

export const UserScalarRelationFilterSchema: z.ZodType<Prisma.UserScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional(),
});

export const ProductListRelationFilterSchema: z.ZodType<Prisma.ProductListRelationFilter> = z.strictObject({
  every: z.lazy(() => ProductWhereInputSchema).optional(),
  some: z.lazy(() => ProductWhereInputSchema).optional(),
  none: z.lazy(() => ProductWhereInputSchema).optional(),
});

export const ProductOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ProductOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const VendorCountOrderByAggregateInputSchema: z.ZodType<Prisma.VendorCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  businessName: z.lazy(() => SortOrderSchema).optional(),
  businessPhone: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const VendorMaxOrderByAggregateInputSchema: z.ZodType<Prisma.VendorMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  businessName: z.lazy(() => SortOrderSchema).optional(),
  businessPhone: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const VendorMinOrderByAggregateInputSchema: z.ZodType<Prisma.VendorMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  businessName: z.lazy(() => SortOrderSchema).optional(),
  businessPhone: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumProductUnitFilterSchema: z.ZodType<Prisma.EnumProductUnitFilter> = z.strictObject({
  equals: z.lazy(() => ProductUnitSchema).optional(),
  in: z.lazy(() => ProductUnitSchema).array().optional(),
  notIn: z.lazy(() => ProductUnitSchema).array().optional(),
  not: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => NestedEnumProductUnitFilterSchema) ]).optional(),
});

export const VendorScalarRelationFilterSchema: z.ZodType<Prisma.VendorScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => VendorWhereInputSchema).optional(),
  isNot: z.lazy(() => VendorWhereInputSchema).optional(),
});

export const CustomerSubscriptionListRelationFilterSchema: z.ZodType<Prisma.CustomerSubscriptionListRelationFilter> = z.strictObject({
  every: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
  some: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
  none: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
});

export const RequestsListRelationFilterSchema: z.ZodType<Prisma.RequestsListRelationFilter> = z.strictObject({
  every: z.lazy(() => RequestsWhereInputSchema).optional(),
  some: z.lazy(() => RequestsWhereInputSchema).optional(),
  none: z.lazy(() => RequestsWhereInputSchema).optional(),
});

export const CustomerSubscriptionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CustomerSubscriptionOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const RequestsOrderByRelationAggregateInputSchema: z.ZodType<Prisma.RequestsOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductCountOrderByAggregateInputSchema: z.ZodType<Prisma.ProductCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.lazy(() => SortOrderSchema).optional(),
  productName: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  unit: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProductMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.lazy(() => SortOrderSchema).optional(),
  productName: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  unit: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductMinOrderByAggregateInputSchema: z.ZodType<Prisma.ProductMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.lazy(() => SortOrderSchema).optional(),
  productName: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  unit: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumProductUnitWithAggregatesFilterSchema: z.ZodType<Prisma.EnumProductUnitWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => ProductUnitSchema).optional(),
  in: z.lazy(() => ProductUnitSchema).array().optional(),
  notIn: z.lazy(() => ProductUnitSchema).array().optional(),
  not: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => NestedEnumProductUnitWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumProductUnitFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumProductUnitFilterSchema).optional(),
});

export const VendorCustomersVendorIdCustomerIdCompoundUniqueInputSchema: z.ZodType<Prisma.VendorCustomersVendorIdCustomerIdCompoundUniqueInput> = z.strictObject({
  vendorId: z.string(),
  customerId: z.string(),
});

export const VendorCustomersCountOrderByAggregateInputSchema: z.ZodType<Prisma.VendorCustomersCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.lazy(() => SortOrderSchema).optional(),
  customerId: z.lazy(() => SortOrderSchema).optional(),
  customerPhone: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const VendorCustomersMaxOrderByAggregateInputSchema: z.ZodType<Prisma.VendorCustomersMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.lazy(() => SortOrderSchema).optional(),
  customerId: z.lazy(() => SortOrderSchema).optional(),
  customerPhone: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const VendorCustomersMinOrderByAggregateInputSchema: z.ZodType<Prisma.VendorCustomersMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.lazy(() => SortOrderSchema).optional(),
  customerId: z.lazy(() => SortOrderSchema).optional(),
  customerPhone: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const DecimalFilterSchema: z.ZodType<Prisma.DecimalFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalFilterSchema) ]).optional(),
});

export const VendorCustomersScalarRelationFilterSchema: z.ZodType<Prisma.VendorCustomersScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
  isNot: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
});

export const ProductScalarRelationFilterSchema: z.ZodType<Prisma.ProductScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => ProductWhereInputSchema).optional(),
  isNot: z.lazy(() => ProductWhereInputSchema).optional(),
});

export const CustomerSubscriptionVendorCustomerIdProductIdCompoundUniqueInputSchema: z.ZodType<Prisma.CustomerSubscriptionVendorCustomerIdProductIdCompoundUniqueInput> = z.strictObject({
  vendorCustomerId: z.string(),
  productId: z.string(),
});

export const CustomerSubscriptionCountOrderByAggregateInputSchema: z.ZodType<Prisma.CustomerSubscriptionCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  dailyQuantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CustomerSubscriptionAvgOrderByAggregateInputSchema: z.ZodType<Prisma.CustomerSubscriptionAvgOrderByAggregateInput> = z.strictObject({
  dailyQuantity: z.lazy(() => SortOrderSchema).optional(),
});

export const CustomerSubscriptionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CustomerSubscriptionMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  dailyQuantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CustomerSubscriptionMinOrderByAggregateInputSchema: z.ZodType<Prisma.CustomerSubscriptionMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  dailyQuantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CustomerSubscriptionSumOrderByAggregateInputSchema: z.ZodType<Prisma.CustomerSubscriptionSumOrderByAggregateInput> = z.strictObject({
  dailyQuantity: z.lazy(() => SortOrderSchema).optional(),
});

export const DecimalWithAggregatesFilterSchema: z.ZodType<Prisma.DecimalWithAggregatesFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalFilterSchema).optional(),
});

export const EnumRequestTypeFilterSchema: z.ZodType<Prisma.EnumRequestTypeFilter> = z.strictObject({
  equals: z.lazy(() => RequestTypeSchema).optional(),
  in: z.lazy(() => RequestTypeSchema).array().optional(),
  notIn: z.lazy(() => RequestTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => NestedEnumRequestTypeFilterSchema) ]).optional(),
});

export const DecimalNullableFilterSchema: z.ZodType<Prisma.DecimalNullableFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalNullableFilterSchema) ]).optional().nullable(),
});

export const EnumStatusFilterSchema: z.ZodType<Prisma.EnumStatusFilter> = z.strictObject({
  equals: z.lazy(() => StatusSchema).optional(),
  in: z.lazy(() => StatusSchema).array().optional(),
  notIn: z.lazy(() => StatusSchema).array().optional(),
  not: z.union([ z.lazy(() => StatusSchema), z.lazy(() => NestedEnumStatusFilterSchema) ]).optional(),
});

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
});

export const CustomerSubscriptionScalarRelationFilterSchema: z.ZodType<Prisma.CustomerSubscriptionScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
  isNot: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
});

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.strictObject({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional(),
});

export const RequestsCountOrderByAggregateInputSchema: z.ZodType<Prisma.RequestsCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  subscriptionId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  start_date: z.lazy(() => SortOrderSchema).optional(),
  end_date: z.lazy(() => SortOrderSchema).optional(),
  requestedQuantity: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  respondedAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const RequestsAvgOrderByAggregateInputSchema: z.ZodType<Prisma.RequestsAvgOrderByAggregateInput> = z.strictObject({
  requestedQuantity: z.lazy(() => SortOrderSchema).optional(),
});

export const RequestsMaxOrderByAggregateInputSchema: z.ZodType<Prisma.RequestsMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  subscriptionId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  start_date: z.lazy(() => SortOrderSchema).optional(),
  end_date: z.lazy(() => SortOrderSchema).optional(),
  requestedQuantity: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  respondedAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const RequestsMinOrderByAggregateInputSchema: z.ZodType<Prisma.RequestsMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  subscriptionId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  start_date: z.lazy(() => SortOrderSchema).optional(),
  end_date: z.lazy(() => SortOrderSchema).optional(),
  requestedQuantity: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  respondedAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const RequestsSumOrderByAggregateInputSchema: z.ZodType<Prisma.RequestsSumOrderByAggregateInput> = z.strictObject({
  requestedQuantity: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumRequestTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumRequestTypeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => RequestTypeSchema).optional(),
  in: z.lazy(() => RequestTypeSchema).array().optional(),
  notIn: z.lazy(() => RequestTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => NestedEnumRequestTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRequestTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRequestTypeFilterSchema).optional(),
});

export const DecimalNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DecimalNullableWithAggregatesFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
});

export const EnumStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => StatusSchema).optional(),
  in: z.lazy(() => StatusSchema).array().optional(),
  notIn: z.lazy(() => StatusSchema).array().optional(),
  not: z.union([ z.lazy(() => StatusSchema), z.lazy(() => NestedEnumStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumStatusFilterSchema).optional(),
});

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
});

export const EnumPlatformFilterSchema: z.ZodType<Prisma.EnumPlatformFilter> = z.strictObject({
  equals: z.lazy(() => PlatformSchema).optional(),
  in: z.lazy(() => PlatformSchema).array().optional(),
  notIn: z.lazy(() => PlatformSchema).array().optional(),
  not: z.union([ z.lazy(() => PlatformSchema), z.lazy(() => NestedEnumPlatformFilterSchema) ]).optional(),
});

export const PushTokenCountOrderByAggregateInputSchema: z.ZodType<Prisma.PushTokenCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  platform: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const PushTokenMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PushTokenMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  platform: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const PushTokenMinOrderByAggregateInputSchema: z.ZodType<Prisma.PushTokenMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  platform: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumPlatformWithAggregatesFilterSchema: z.ZodType<Prisma.EnumPlatformWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => PlatformSchema).optional(),
  in: z.lazy(() => PlatformSchema).array().optional(),
  notIn: z.lazy(() => PlatformSchema).array().optional(),
  not: z.union([ z.lazy(() => PlatformSchema), z.lazy(() => NestedEnumPlatformWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPlatformFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPlatformFilterSchema).optional(),
});

export const VendorCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.VendorCreateNestedOneWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCreateWithoutUserInputSchema), z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
});

export const VendorCustomersCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.VendorCustomersCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateWithoutUserInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VendorCustomersCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
});

export const PushTokenCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.PushTokenCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => PushTokenCreateWithoutUserInputSchema), z.lazy(() => PushTokenCreateWithoutUserInputSchema).array(), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema), z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PushTokenCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array() ]).optional(),
});

export const VendorUncheckedCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.VendorUncheckedCreateNestedOneWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCreateWithoutUserInputSchema), z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
});

export const VendorCustomersUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateWithoutUserInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VendorCustomersCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
});

export const PushTokenUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.PushTokenUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => PushTokenCreateWithoutUserInputSchema), z.lazy(() => PushTokenCreateWithoutUserInputSchema).array(), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema), z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PushTokenCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array() ]).optional(),
});

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.strictObject({
  set: z.string().optional(),
});

export const EnumRoleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRoleFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => RoleSchema).optional(),
});

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.strictObject({
  set: z.coerce.date().optional(),
});

export const VendorUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.VendorUpdateOneWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCreateWithoutUserInputSchema), z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => VendorUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => VendorWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => VendorWhereInputSchema) ]).optional(),
  connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => VendorUpdateToOneWithWhereWithoutUserInputSchema), z.lazy(() => VendorUpdateWithoutUserInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutUserInputSchema) ]).optional(),
});

export const VendorCustomersUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.VendorCustomersUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateWithoutUserInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VendorCustomersCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VendorCustomersScalarWhereInputSchema), z.lazy(() => VendorCustomersScalarWhereInputSchema).array() ]).optional(),
});

export const PushTokenUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.PushTokenUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PushTokenCreateWithoutUserInputSchema), z.lazy(() => PushTokenCreateWithoutUserInputSchema).array(), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema), z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PushTokenUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => PushTokenUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PushTokenCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PushTokenUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => PushTokenUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PushTokenUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => PushTokenUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PushTokenScalarWhereInputSchema), z.lazy(() => PushTokenScalarWhereInputSchema).array() ]).optional(),
});

export const VendorUncheckedUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.VendorUncheckedUpdateOneWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCreateWithoutUserInputSchema), z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => VendorUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => VendorWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => VendorWhereInputSchema) ]).optional(),
  connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => VendorUpdateToOneWithWhereWithoutUserInputSchema), z.lazy(() => VendorUpdateWithoutUserInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutUserInputSchema) ]).optional(),
});

export const VendorCustomersUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateWithoutUserInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VendorCustomersCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VendorCustomersScalarWhereInputSchema), z.lazy(() => VendorCustomersScalarWhereInputSchema).array() ]).optional(),
});

export const PushTokenUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.PushTokenUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PushTokenCreateWithoutUserInputSchema), z.lazy(() => PushTokenCreateWithoutUserInputSchema).array(), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema), z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PushTokenUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => PushTokenUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PushTokenCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PushTokenUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => PushTokenUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PushTokenUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => PushTokenUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PushTokenScalarWhereInputSchema), z.lazy(() => PushTokenScalarWhereInputSchema).array() ]).optional(),
});

export const UserCreateNestedOneWithoutVendorInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutVendorInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutVendorInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutVendorInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const ProductCreateNestedManyWithoutVendorInputSchema: z.ZodType<Prisma.ProductCreateNestedManyWithoutVendorInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductCreateWithoutVendorInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema), z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyVendorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
});

export const VendorCustomersCreateNestedManyWithoutVendorInputSchema: z.ZodType<Prisma.VendorCustomersCreateNestedManyWithoutVendorInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VendorCustomersCreateManyVendorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
});

export const ProductUncheckedCreateNestedManyWithoutVendorInputSchema: z.ZodType<Prisma.ProductUncheckedCreateNestedManyWithoutVendorInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductCreateWithoutVendorInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema), z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyVendorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
});

export const VendorCustomersUncheckedCreateNestedManyWithoutVendorInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedCreateNestedManyWithoutVendorInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VendorCustomersCreateManyVendorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
});

export const UserUpdateOneRequiredWithoutVendorNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutVendorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutVendorInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutVendorInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutVendorInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutVendorInputSchema), z.lazy(() => UserUpdateWithoutVendorInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVendorInputSchema) ]).optional(),
});

export const ProductUpdateManyWithoutVendorNestedInputSchema: z.ZodType<Prisma.ProductUpdateManyWithoutVendorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductCreateWithoutVendorInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema), z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => ProductUpsertWithWhereUniqueWithoutVendorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyVendorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => ProductUpdateWithWhereUniqueWithoutVendorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutVendorInputSchema), z.lazy(() => ProductUpdateManyWithWhereWithoutVendorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
});

export const VendorCustomersUpdateManyWithoutVendorNestedInputSchema: z.ZodType<Prisma.VendorCustomersUpdateManyWithoutVendorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutVendorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VendorCustomersCreateManyVendorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutVendorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutVendorInputSchema), z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutVendorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VendorCustomersScalarWhereInputSchema), z.lazy(() => VendorCustomersScalarWhereInputSchema).array() ]).optional(),
});

export const ProductUncheckedUpdateManyWithoutVendorNestedInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutVendorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductCreateWithoutVendorInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema), z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => ProductUpsertWithWhereUniqueWithoutVendorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyVendorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => ProductUpdateWithWhereUniqueWithoutVendorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutVendorInputSchema), z.lazy(() => ProductUpdateManyWithWhereWithoutVendorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
});

export const VendorCustomersUncheckedUpdateManyWithoutVendorNestedInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedUpdateManyWithoutVendorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutVendorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VendorCustomersCreateManyVendorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutVendorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutVendorInputSchema), z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutVendorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VendorCustomersScalarWhereInputSchema), z.lazy(() => VendorCustomersScalarWhereInputSchema).array() ]).optional(),
});

export const VendorCreateNestedOneWithoutProductInputSchema: z.ZodType<Prisma.VendorCreateNestedOneWithoutProductInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCreateWithoutProductInputSchema), z.lazy(() => VendorUncheckedCreateWithoutProductInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutProductInputSchema).optional(),
  connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
});

export const CustomerSubscriptionCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.CustomerSubscriptionCreateNestedManyWithoutProductInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CustomerSubscriptionCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
});

export const RequestsCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.RequestsCreateNestedManyWithoutProductInput> = z.strictObject({
  create: z.union([ z.lazy(() => RequestsCreateWithoutProductInputSchema), z.lazy(() => RequestsCreateWithoutProductInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RequestsCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
});

export const CustomerSubscriptionUncheckedCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedCreateNestedManyWithoutProductInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CustomerSubscriptionCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
});

export const RequestsUncheckedCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.RequestsUncheckedCreateNestedManyWithoutProductInput> = z.strictObject({
  create: z.union([ z.lazy(() => RequestsCreateWithoutProductInputSchema), z.lazy(() => RequestsCreateWithoutProductInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RequestsCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
});

export const EnumProductUnitFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumProductUnitFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => ProductUnitSchema).optional(),
});

export const VendorUpdateOneRequiredWithoutProductNestedInputSchema: z.ZodType<Prisma.VendorUpdateOneRequiredWithoutProductNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCreateWithoutProductInputSchema), z.lazy(() => VendorUncheckedCreateWithoutProductInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutProductInputSchema).optional(),
  upsert: z.lazy(() => VendorUpsertWithoutProductInputSchema).optional(),
  connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => VendorUpdateToOneWithWhereWithoutProductInputSchema), z.lazy(() => VendorUpdateWithoutProductInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutProductInputSchema) ]).optional(),
});

export const CustomerSubscriptionUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateManyWithoutProductNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CustomerSubscriptionCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CustomerSubscriptionScalarWhereInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array() ]).optional(),
});

export const RequestsUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.RequestsUpdateManyWithoutProductNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => RequestsCreateWithoutProductInputSchema), z.lazy(() => RequestsCreateWithoutProductInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RequestsUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => RequestsUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RequestsCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RequestsUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => RequestsUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RequestsUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => RequestsUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array() ]).optional(),
});

export const CustomerSubscriptionUncheckedUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedUpdateManyWithoutProductNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CustomerSubscriptionCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CustomerSubscriptionScalarWhereInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array() ]).optional(),
});

export const RequestsUncheckedUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.RequestsUncheckedUpdateManyWithoutProductNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => RequestsCreateWithoutProductInputSchema), z.lazy(() => RequestsCreateWithoutProductInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RequestsUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => RequestsUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RequestsCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RequestsUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => RequestsUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RequestsUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => RequestsUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array() ]).optional(),
});

export const VendorCreateNestedOneWithoutVendorcustomersInputSchema: z.ZodType<Prisma.VendorCreateNestedOneWithoutVendorcustomersInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCreateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedCreateWithoutVendorcustomersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutVendorcustomersInputSchema).optional(),
  connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
});

export const UserCreateNestedOneWithoutVendorcustomersInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutVendorcustomersInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorcustomersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutVendorcustomersInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const CustomerSubscriptionCreateNestedManyWithoutVendorCustomersInputSchema: z.ZodType<Prisma.CustomerSubscriptionCreateNestedManyWithoutVendorCustomersInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CustomerSubscriptionCreateManyVendorCustomersInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
});

export const RequestsCreateNestedManyWithoutVendorCustomersInputSchema: z.ZodType<Prisma.RequestsCreateNestedManyWithoutVendorCustomersInput> = z.strictObject({
  create: z.union([ z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RequestsCreateManyVendorCustomersInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
});

export const CustomerSubscriptionUncheckedCreateNestedManyWithoutVendorCustomersInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedCreateNestedManyWithoutVendorCustomersInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CustomerSubscriptionCreateManyVendorCustomersInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
});

export const RequestsUncheckedCreateNestedManyWithoutVendorCustomersInputSchema: z.ZodType<Prisma.RequestsUncheckedCreateNestedManyWithoutVendorCustomersInput> = z.strictObject({
  create: z.union([ z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RequestsCreateManyVendorCustomersInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
});

export const VendorUpdateOneRequiredWithoutVendorcustomersNestedInputSchema: z.ZodType<Prisma.VendorUpdateOneRequiredWithoutVendorcustomersNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCreateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedCreateWithoutVendorcustomersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutVendorcustomersInputSchema).optional(),
  upsert: z.lazy(() => VendorUpsertWithoutVendorcustomersInputSchema).optional(),
  connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => VendorUpdateToOneWithWhereWithoutVendorcustomersInputSchema), z.lazy(() => VendorUpdateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutVendorcustomersInputSchema) ]).optional(),
});

export const UserUpdateOneRequiredWithoutVendorcustomersNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutVendorcustomersNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorcustomersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutVendorcustomersInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutVendorcustomersInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutVendorcustomersInputSchema), z.lazy(() => UserUpdateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVendorcustomersInputSchema) ]).optional(),
});

export const CustomerSubscriptionUpdateManyWithoutVendorCustomersNestedInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateManyWithoutVendorCustomersNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutVendorCustomersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CustomerSubscriptionCreateManyVendorCustomersInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutVendorCustomersInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutVendorCustomersInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CustomerSubscriptionScalarWhereInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array() ]).optional(),
});

export const RequestsUpdateManyWithoutVendorCustomersNestedInputSchema: z.ZodType<Prisma.RequestsUpdateManyWithoutVendorCustomersNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RequestsUpsertWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUpsertWithWhereUniqueWithoutVendorCustomersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RequestsCreateManyVendorCustomersInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RequestsUpdateWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUpdateWithWhereUniqueWithoutVendorCustomersInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RequestsUpdateManyWithWhereWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUpdateManyWithWhereWithoutVendorCustomersInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array() ]).optional(),
});

export const CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutVendorCustomersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CustomerSubscriptionCreateManyVendorCustomersInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutVendorCustomersInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutVendorCustomersInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CustomerSubscriptionScalarWhereInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array() ]).optional(),
});

export const RequestsUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema: z.ZodType<Prisma.RequestsUncheckedUpdateManyWithoutVendorCustomersNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RequestsUpsertWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUpsertWithWhereUniqueWithoutVendorCustomersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RequestsCreateManyVendorCustomersInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RequestsUpdateWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUpdateWithWhereUniqueWithoutVendorCustomersInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RequestsUpdateManyWithWhereWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUpdateManyWithWhereWithoutVendorCustomersInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array() ]).optional(),
});

export const VendorCustomersCreateNestedOneWithoutSubscriptionInputSchema: z.ZodType<Prisma.VendorCustomersCreateNestedOneWithoutSubscriptionInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutSubscriptionInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VendorCustomersCreateOrConnectWithoutSubscriptionInputSchema).optional(),
  connect: z.lazy(() => VendorCustomersWhereUniqueInputSchema).optional(),
});

export const ProductCreateNestedOneWithoutSubscriptionInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutSubscriptionInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSubscriptionInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutSubscriptionInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
});

export const RequestsCreateNestedManyWithoutSubscriptionInputSchema: z.ZodType<Prisma.RequestsCreateNestedManyWithoutSubscriptionInput> = z.strictObject({
  create: z.union([ z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RequestsCreateManySubscriptionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
});

export const RequestsUncheckedCreateNestedManyWithoutSubscriptionInputSchema: z.ZodType<Prisma.RequestsUncheckedCreateNestedManyWithoutSubscriptionInput> = z.strictObject({
  create: z.union([ z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RequestsCreateManySubscriptionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
});

export const DecimalFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DecimalFieldUpdateOperationsInput> = z.strictObject({
  set: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  increment: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  decrement: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  multiply: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  divide: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
});

export const VendorCustomersUpdateOneRequiredWithoutSubscriptionNestedInputSchema: z.ZodType<Prisma.VendorCustomersUpdateOneRequiredWithoutSubscriptionNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutSubscriptionInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VendorCustomersCreateOrConnectWithoutSubscriptionInputSchema).optional(),
  upsert: z.lazy(() => VendorCustomersUpsertWithoutSubscriptionInputSchema).optional(),
  connect: z.lazy(() => VendorCustomersWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => VendorCustomersUpdateToOneWithWhereWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUpdateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutSubscriptionInputSchema) ]).optional(),
});

export const ProductUpdateOneRequiredWithoutSubscriptionNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneRequiredWithoutSubscriptionNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSubscriptionInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutSubscriptionInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutSubscriptionInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutSubscriptionInputSchema), z.lazy(() => ProductUpdateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutSubscriptionInputSchema) ]).optional(),
});

export const RequestsUpdateManyWithoutSubscriptionNestedInputSchema: z.ZodType<Prisma.RequestsUpdateManyWithoutSubscriptionNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RequestsUpsertWithWhereUniqueWithoutSubscriptionInputSchema), z.lazy(() => RequestsUpsertWithWhereUniqueWithoutSubscriptionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RequestsCreateManySubscriptionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RequestsUpdateWithWhereUniqueWithoutSubscriptionInputSchema), z.lazy(() => RequestsUpdateWithWhereUniqueWithoutSubscriptionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RequestsUpdateManyWithWhereWithoutSubscriptionInputSchema), z.lazy(() => RequestsUpdateManyWithWhereWithoutSubscriptionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array() ]).optional(),
});

export const RequestsUncheckedUpdateManyWithoutSubscriptionNestedInputSchema: z.ZodType<Prisma.RequestsUncheckedUpdateManyWithoutSubscriptionNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RequestsUpsertWithWhereUniqueWithoutSubscriptionInputSchema), z.lazy(() => RequestsUpsertWithWhereUniqueWithoutSubscriptionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RequestsCreateManySubscriptionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RequestsUpdateWithWhereUniqueWithoutSubscriptionInputSchema), z.lazy(() => RequestsUpdateWithWhereUniqueWithoutSubscriptionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RequestsUpdateManyWithWhereWithoutSubscriptionInputSchema), z.lazy(() => RequestsUpdateManyWithWhereWithoutSubscriptionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array() ]).optional(),
});

export const VendorCustomersCreateNestedOneWithoutRequestInputSchema: z.ZodType<Prisma.VendorCustomersCreateNestedOneWithoutRequestInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutRequestInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VendorCustomersCreateOrConnectWithoutRequestInputSchema).optional(),
  connect: z.lazy(() => VendorCustomersWhereUniqueInputSchema).optional(),
});

export const ProductCreateNestedOneWithoutRequestInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutRequestInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedCreateWithoutRequestInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutRequestInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
});

export const CustomerSubscriptionCreateNestedOneWithoutRequestsInputSchema: z.ZodType<Prisma.CustomerSubscriptionCreateNestedOneWithoutRequestsInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutRequestsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutRequestsInputSchema).optional(),
  connect: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).optional(),
});

export const EnumRequestTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRequestTypeFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => RequestTypeSchema).optional(),
});

export const NullableDecimalFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDecimalFieldUpdateOperationsInput> = z.strictObject({
  set: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  increment: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  decrement: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  multiply: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  divide: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
});

export const EnumStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => StatusSchema).optional(),
});

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.strictObject({
  set: z.coerce.date().optional().nullable(),
});

export const VendorCustomersUpdateOneRequiredWithoutRequestNestedInputSchema: z.ZodType<Prisma.VendorCustomersUpdateOneRequiredWithoutRequestNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutRequestInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VendorCustomersCreateOrConnectWithoutRequestInputSchema).optional(),
  upsert: z.lazy(() => VendorCustomersUpsertWithoutRequestInputSchema).optional(),
  connect: z.lazy(() => VendorCustomersWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => VendorCustomersUpdateToOneWithWhereWithoutRequestInputSchema), z.lazy(() => VendorCustomersUpdateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutRequestInputSchema) ]).optional(),
});

export const ProductUpdateOneRequiredWithoutRequestNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneRequiredWithoutRequestNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedCreateWithoutRequestInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutRequestInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutRequestInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutRequestInputSchema), z.lazy(() => ProductUpdateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutRequestInputSchema) ]).optional(),
});

export const CustomerSubscriptionUpdateOneRequiredWithoutRequestsNestedInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateOneRequiredWithoutRequestsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutRequestsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutRequestsInputSchema).optional(),
  upsert: z.lazy(() => CustomerSubscriptionUpsertWithoutRequestsInputSchema).optional(),
  connect: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CustomerSubscriptionUpdateToOneWithWhereWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUpdateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutRequestsInputSchema) ]).optional(),
});

export const UserCreateNestedOneWithoutPushTokenInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutPushTokenInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedCreateWithoutPushTokenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPushTokenInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const EnumPlatformFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPlatformFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => PlatformSchema).optional(),
});

export const UserUpdateOneRequiredWithoutPushTokenNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutPushTokenNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedCreateWithoutPushTokenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPushTokenInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutPushTokenInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutPushTokenInputSchema), z.lazy(() => UserUpdateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedUpdateWithoutPushTokenInputSchema) ]).optional(),
});

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
});

export const NestedEnumRoleFilterSchema: z.ZodType<Prisma.NestedEnumRoleFilter> = z.strictObject({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema), z.lazy(() => NestedEnumRoleFilterSchema) ]).optional(),
});

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
});

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
});

export const NestedEnumRoleWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRoleWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema), z.lazy(() => NestedEnumRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
});

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
});

export const NestedEnumProductUnitFilterSchema: z.ZodType<Prisma.NestedEnumProductUnitFilter> = z.strictObject({
  equals: z.lazy(() => ProductUnitSchema).optional(),
  in: z.lazy(() => ProductUnitSchema).array().optional(),
  notIn: z.lazy(() => ProductUnitSchema).array().optional(),
  not: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => NestedEnumProductUnitFilterSchema) ]).optional(),
});

export const NestedEnumProductUnitWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumProductUnitWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => ProductUnitSchema).optional(),
  in: z.lazy(() => ProductUnitSchema).array().optional(),
  notIn: z.lazy(() => ProductUnitSchema).array().optional(),
  not: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => NestedEnumProductUnitWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumProductUnitFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumProductUnitFilterSchema).optional(),
});

export const NestedDecimalFilterSchema: z.ZodType<Prisma.NestedDecimalFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalFilterSchema) ]).optional(),
});

export const NestedDecimalWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDecimalWithAggregatesFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalFilterSchema).optional(),
});

export const NestedEnumRequestTypeFilterSchema: z.ZodType<Prisma.NestedEnumRequestTypeFilter> = z.strictObject({
  equals: z.lazy(() => RequestTypeSchema).optional(),
  in: z.lazy(() => RequestTypeSchema).array().optional(),
  notIn: z.lazy(() => RequestTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => NestedEnumRequestTypeFilterSchema) ]).optional(),
});

export const NestedDecimalNullableFilterSchema: z.ZodType<Prisma.NestedDecimalNullableFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalNullableFilterSchema) ]).optional().nullable(),
});

export const NestedEnumStatusFilterSchema: z.ZodType<Prisma.NestedEnumStatusFilter> = z.strictObject({
  equals: z.lazy(() => StatusSchema).optional(),
  in: z.lazy(() => StatusSchema).array().optional(),
  notIn: z.lazy(() => StatusSchema).array().optional(),
  not: z.union([ z.lazy(() => StatusSchema), z.lazy(() => NestedEnumStatusFilterSchema) ]).optional(),
});

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
});

export const NestedEnumRequestTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRequestTypeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => RequestTypeSchema).optional(),
  in: z.lazy(() => RequestTypeSchema).array().optional(),
  notIn: z.lazy(() => RequestTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => NestedEnumRequestTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRequestTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRequestTypeFilterSchema).optional(),
});

export const NestedDecimalNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDecimalNullableWithAggregatesFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
});

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
});

export const NestedEnumStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => StatusSchema).optional(),
  in: z.lazy(() => StatusSchema).array().optional(),
  notIn: z.lazy(() => StatusSchema).array().optional(),
  not: z.union([ z.lazy(() => StatusSchema), z.lazy(() => NestedEnumStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumStatusFilterSchema).optional(),
});

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
});

export const NestedEnumPlatformFilterSchema: z.ZodType<Prisma.NestedEnumPlatformFilter> = z.strictObject({
  equals: z.lazy(() => PlatformSchema).optional(),
  in: z.lazy(() => PlatformSchema).array().optional(),
  notIn: z.lazy(() => PlatformSchema).array().optional(),
  not: z.union([ z.lazy(() => PlatformSchema), z.lazy(() => NestedEnumPlatformFilterSchema) ]).optional(),
});

export const NestedEnumPlatformWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumPlatformWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => PlatformSchema).optional(),
  in: z.lazy(() => PlatformSchema).array().optional(),
  notIn: z.lazy(() => PlatformSchema).array().optional(),
  not: z.union([ z.lazy(() => PlatformSchema), z.lazy(() => NestedEnumPlatformWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPlatformFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPlatformFilterSchema).optional(),
});

export const VendorCreateWithoutUserInputSchema: z.ZodType<Prisma.VendorCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  businessName: z.string().min(2,{message: "Business name must be at least 2 characters long"}),
  businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  product: z.lazy(() => ProductCreateNestedManyWithoutVendorInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersCreateNestedManyWithoutVendorInputSchema).optional(),
});

export const VendorUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.VendorUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  businessName: z.string().min(2,{message: "Business name must be at least 2 characters long"}),
  businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  product: z.lazy(() => ProductUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
});

export const VendorCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.VendorCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => VendorWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => VendorCreateWithoutUserInputSchema), z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema) ]),
});

export const VendorCustomersCreateWithoutUserInputSchema: z.ZodType<Prisma.VendorCustomersCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  customerPhone: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendor: z.lazy(() => VendorCreateNestedOneWithoutVendorcustomersInputSchema),
  subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
  request: z.lazy(() => RequestsCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});

export const VendorCustomersUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorId: z.string(),
  customerPhone: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
  request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});

export const VendorCustomersCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.VendorCustomersCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema) ]),
});

export const VendorCustomersCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.VendorCustomersCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => VendorCustomersCreateManyUserInputSchema), z.lazy(() => VendorCustomersCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const PushTokenCreateWithoutUserInputSchema: z.ZodType<Prisma.PushTokenCreateWithoutUserInput> = z.strictObject({
  id: z.cuid().optional(),
  token: z.string(),
  platform: z.lazy(() => PlatformSchema),
  createdAt: z.coerce.date().optional(),
});

export const PushTokenUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.PushTokenUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.cuid().optional(),
  token: z.string(),
  platform: z.lazy(() => PlatformSchema),
  createdAt: z.coerce.date().optional(),
});

export const PushTokenCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.PushTokenCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => PushTokenWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PushTokenCreateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema) ]),
});

export const PushTokenCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.PushTokenCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => PushTokenCreateManyUserInputSchema), z.lazy(() => PushTokenCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const VendorUpsertWithoutUserInputSchema: z.ZodType<Prisma.VendorUpsertWithoutUserInput> = z.strictObject({
  update: z.union([ z.lazy(() => VendorUpdateWithoutUserInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => VendorCreateWithoutUserInputSchema), z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema) ]),
  where: z.lazy(() => VendorWhereInputSchema).optional(),
});

export const VendorUpdateToOneWithWhereWithoutUserInputSchema: z.ZodType<Prisma.VendorUpdateToOneWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => VendorWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => VendorUpdateWithoutUserInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutUserInputSchema) ]),
});

export const VendorUpdateWithoutUserInputSchema: z.ZodType<Prisma.VendorUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessName: z.union([ z.string().min(2,{message: "Business name must be at least 2 characters long"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessPhone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUpdateManyWithoutVendorNestedInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUpdateManyWithoutVendorNestedInputSchema).optional(),
});

export const VendorUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.VendorUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessName: z.union([ z.string().min(2,{message: "Business name must be at least 2 characters long"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessPhone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
});

export const VendorCustomersUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.VendorCustomersUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => VendorCustomersUpdateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema) ]),
});

export const VendorCustomersUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.VendorCustomersUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => VendorCustomersUpdateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutUserInputSchema) ]),
});

export const VendorCustomersUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.VendorCustomersUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => VendorCustomersScalarWhereInputSchema),
  data: z.union([ z.lazy(() => VendorCustomersUpdateManyMutationInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const VendorCustomersScalarWhereInputSchema: z.ZodType<Prisma.VendorCustomersScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => VendorCustomersScalarWhereInputSchema), z.lazy(() => VendorCustomersScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VendorCustomersScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VendorCustomersScalarWhereInputSchema), z.lazy(() => VendorCustomersScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  vendorId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  customerId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  customerPhone: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const PushTokenUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PushTokenUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => PushTokenWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PushTokenUpdateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => PushTokenCreateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema) ]),
});

export const PushTokenUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PushTokenUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => PushTokenWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PushTokenUpdateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedUpdateWithoutUserInputSchema) ]),
});

export const PushTokenUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.PushTokenUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => PushTokenScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PushTokenUpdateManyMutationInputSchema), z.lazy(() => PushTokenUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const PushTokenScalarWhereInputSchema: z.ZodType<Prisma.PushTokenScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => PushTokenScalarWhereInputSchema), z.lazy(() => PushTokenScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PushTokenScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PushTokenScalarWhereInputSchema), z.lazy(() => PushTokenScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  platform: z.union([ z.lazy(() => EnumPlatformFilterSchema), z.lazy(() => PlatformSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const UserCreateWithoutVendorInputSchema: z.ZodType<Prisma.UserCreateWithoutVendorInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  address: z.string(),
  role: z.lazy(() => RoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendorcustomers: z.lazy(() => VendorCustomersCreateNestedManyWithoutUserInputSchema).optional(),
  pushToken: z.lazy(() => PushTokenCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutVendorInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutVendorInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  address: z.string(),
  role: z.lazy(() => RoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  pushToken: z.lazy(() => PushTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutVendorInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutVendorInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorInputSchema) ]),
});

export const ProductCreateWithoutVendorInputSchema: z.ZodType<Prisma.ProductCreateWithoutVendorInput> = z.strictObject({
  id: z.uuid().optional(),
  productName: z.string().min(2,{message: "Product name must be of at least 2 characters"}),
  description: z.string().min(2, {message: "Product description must be of at leat 2 characters"}),
  unit: z.lazy(() => ProductUnitSchema),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutProductInputSchema).optional(),
  request: z.lazy(() => RequestsCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateWithoutVendorInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutVendorInput> = z.strictObject({
  id: z.uuid().optional(),
  productName: z.string().min(2,{message: "Product name must be of at least 2 characters"}),
  description: z.string().min(2, {message: "Product description must be of at leat 2 characters"}),
  unit: z.lazy(() => ProductUnitSchema),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductCreateOrConnectWithoutVendorInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema) ]),
});

export const ProductCreateManyVendorInputEnvelopeSchema: z.ZodType<Prisma.ProductCreateManyVendorInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => ProductCreateManyVendorInputSchema), z.lazy(() => ProductCreateManyVendorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const VendorCustomersCreateWithoutVendorInputSchema: z.ZodType<Prisma.VendorCustomersCreateWithoutVendorInput> = z.strictObject({
  id: z.uuid().optional(),
  customerPhone: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutVendorcustomersInputSchema),
  subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
  request: z.lazy(() => RequestsCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});

export const VendorCustomersUncheckedCreateWithoutVendorInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedCreateWithoutVendorInput> = z.strictObject({
  id: z.uuid().optional(),
  customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  customerPhone: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
  request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});

export const VendorCustomersCreateOrConnectWithoutVendorInputSchema: z.ZodType<Prisma.VendorCustomersCreateOrConnectWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema) ]),
});

export const VendorCustomersCreateManyVendorInputEnvelopeSchema: z.ZodType<Prisma.VendorCustomersCreateManyVendorInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => VendorCustomersCreateManyVendorInputSchema), z.lazy(() => VendorCustomersCreateManyVendorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const UserUpsertWithoutVendorInputSchema: z.ZodType<Prisma.UserUpsertWithoutVendorInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutVendorInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVendorInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutVendorInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutVendorInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutVendorInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVendorInputSchema) ]),
});

export const UserUpdateWithoutVendorInputSchema: z.ZodType<Prisma.UserUpdateWithoutVendorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(2, { message: "Name must be at least 2 characters long" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUpdateManyWithoutUserNestedInputSchema).optional(),
  pushToken: z.lazy(() => PushTokenUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutVendorInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutVendorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(2, { message: "Name must be at least 2 characters long" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  pushToken: z.lazy(() => PushTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const ProductUpsertWithWhereUniqueWithoutVendorInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProductUpdateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutVendorInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema) ]),
});

export const ProductUpdateWithWhereUniqueWithoutVendorInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutVendorInputSchema) ]),
});

export const ProductUpdateManyWithWhereWithoutVendorInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => ProductScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateManyMutationInputSchema), z.lazy(() => ProductUncheckedUpdateManyWithoutVendorInputSchema) ]),
});

export const ProductScalarWhereInputSchema: z.ZodType<Prisma.ProductScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  vendorId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productName: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  unit: z.union([ z.lazy(() => EnumProductUnitFilterSchema), z.lazy(() => ProductUnitSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const VendorCustomersUpsertWithWhereUniqueWithoutVendorInputSchema: z.ZodType<Prisma.VendorCustomersUpsertWithWhereUniqueWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => VendorCustomersUpdateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutVendorInputSchema) ]),
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema) ]),
});

export const VendorCustomersUpdateWithWhereUniqueWithoutVendorInputSchema: z.ZodType<Prisma.VendorCustomersUpdateWithWhereUniqueWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => VendorCustomersUpdateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutVendorInputSchema) ]),
});

export const VendorCustomersUpdateManyWithWhereWithoutVendorInputSchema: z.ZodType<Prisma.VendorCustomersUpdateManyWithWhereWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => VendorCustomersScalarWhereInputSchema),
  data: z.union([ z.lazy(() => VendorCustomersUpdateManyMutationInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutVendorInputSchema) ]),
});

export const VendorCreateWithoutProductInputSchema: z.ZodType<Prisma.VendorCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  businessName: z.string().min(2,{message: "Business name must be at least 2 characters long"}),
  businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutVendorInputSchema),
  vendorcustomers: z.lazy(() => VendorCustomersCreateNestedManyWithoutVendorInputSchema).optional(),
});

export const VendorUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.VendorUncheckedCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  businessName: z.string().min(2,{message: "Business name must be at least 2 characters long"}),
  businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
});

export const VendorCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.VendorCreateOrConnectWithoutProductInput> = z.strictObject({
  where: z.lazy(() => VendorWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => VendorCreateWithoutProductInputSchema), z.lazy(() => VendorUncheckedCreateWithoutProductInputSchema) ]),
});

export const CustomerSubscriptionCreateWithoutProductInputSchema: z.ZodType<Prisma.CustomerSubscriptionCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  startDate: z.coerce.date(),
  dailyQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendorCustomers: z.lazy(() => VendorCustomersCreateNestedOneWithoutSubscriptionInputSchema),
  requests: z.lazy(() => RequestsCreateNestedManyWithoutSubscriptionInputSchema).optional(),
});

export const CustomerSubscriptionUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorCustomerId: z.string(),
  startDate: z.coerce.date(),
  dailyQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  requests: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutSubscriptionInputSchema).optional(),
});

export const CustomerSubscriptionCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.CustomerSubscriptionCreateOrConnectWithoutProductInput> = z.strictObject({
  where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema) ]),
});

export const CustomerSubscriptionCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.CustomerSubscriptionCreateManyProductInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => CustomerSubscriptionCreateManyProductInputSchema), z.lazy(() => CustomerSubscriptionCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const RequestsCreateWithoutProductInputSchema: z.ZodType<Prisma.RequestsCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => RequestTypeSchema).optional(),
  message: z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  requestedQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  status: z.lazy(() => StatusSchema).optional(),
  respondedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendorCustomers: z.lazy(() => VendorCustomersCreateNestedOneWithoutRequestInputSchema),
  subscription: z.lazy(() => CustomerSubscriptionCreateNestedOneWithoutRequestsInputSchema),
});

export const RequestsUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.RequestsUncheckedCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorCustomerId: z.string(),
  subscriptionId: z.string(),
  type: z.lazy(() => RequestTypeSchema).optional(),
  message: z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  requestedQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  status: z.lazy(() => StatusSchema).optional(),
  respondedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const RequestsCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.RequestsCreateOrConnectWithoutProductInput> = z.strictObject({
  where: z.lazy(() => RequestsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RequestsCreateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema) ]),
});

export const RequestsCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.RequestsCreateManyProductInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => RequestsCreateManyProductInputSchema), z.lazy(() => RequestsCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const VendorUpsertWithoutProductInputSchema: z.ZodType<Prisma.VendorUpsertWithoutProductInput> = z.strictObject({
  update: z.union([ z.lazy(() => VendorUpdateWithoutProductInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => VendorCreateWithoutProductInputSchema), z.lazy(() => VendorUncheckedCreateWithoutProductInputSchema) ]),
  where: z.lazy(() => VendorWhereInputSchema).optional(),
});

export const VendorUpdateToOneWithWhereWithoutProductInputSchema: z.ZodType<Prisma.VendorUpdateToOneWithWhereWithoutProductInput> = z.strictObject({
  where: z.lazy(() => VendorWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => VendorUpdateWithoutProductInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutProductInputSchema) ]),
});

export const VendorUpdateWithoutProductInputSchema: z.ZodType<Prisma.VendorUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessName: z.union([ z.string().min(2,{message: "Business name must be at least 2 characters long"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessPhone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutVendorNestedInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUpdateManyWithoutVendorNestedInputSchema).optional(),
});

export const VendorUncheckedUpdateWithoutProductInputSchema: z.ZodType<Prisma.VendorUncheckedUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessName: z.union([ z.string().min(2,{message: "Business name must be at least 2 characters long"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessPhone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
});

export const CustomerSubscriptionUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpsertWithWhereUniqueWithoutProductInput> = z.strictObject({
  where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CustomerSubscriptionUpdateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema) ]),
});

export const CustomerSubscriptionUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateWithWhereUniqueWithoutProductInput> = z.strictObject({
  where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CustomerSubscriptionUpdateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutProductInputSchema) ]),
});

export const CustomerSubscriptionUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateManyWithWhereWithoutProductInput> = z.strictObject({
  where: z.lazy(() => CustomerSubscriptionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CustomerSubscriptionUpdateManyMutationInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutProductInputSchema) ]),
});

export const CustomerSubscriptionScalarWhereInputSchema: z.ZodType<Prisma.CustomerSubscriptionScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CustomerSubscriptionScalarWhereInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CustomerSubscriptionScalarWhereInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  vendorCustomerId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  startDate: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  dailyQuantity: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const RequestsUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.RequestsUpsertWithWhereUniqueWithoutProductInput> = z.strictObject({
  where: z.lazy(() => RequestsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => RequestsUpdateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => RequestsCreateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema) ]),
});

export const RequestsUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.RequestsUpdateWithWhereUniqueWithoutProductInput> = z.strictObject({
  where: z.lazy(() => RequestsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => RequestsUpdateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedUpdateWithoutProductInputSchema) ]),
});

export const RequestsUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.RequestsUpdateManyWithWhereWithoutProductInput> = z.strictObject({
  where: z.lazy(() => RequestsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => RequestsUpdateManyMutationInputSchema), z.lazy(() => RequestsUncheckedUpdateManyWithoutProductInputSchema) ]),
});

export const RequestsScalarWhereInputSchema: z.ZodType<Prisma.RequestsScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RequestsScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  vendorCustomerId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  subscriptionId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumRequestTypeFilterSchema), z.lazy(() => RequestTypeSchema) ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  start_date: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  end_date: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  requestedQuantity: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumStatusFilterSchema), z.lazy(() => StatusSchema) ]).optional(),
  respondedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const VendorCreateWithoutVendorcustomersInputSchema: z.ZodType<Prisma.VendorCreateWithoutVendorcustomersInput> = z.strictObject({
  id: z.uuid().optional(),
  businessName: z.string().min(2,{message: "Business name must be at least 2 characters long"}),
  businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutVendorInputSchema),
  product: z.lazy(() => ProductCreateNestedManyWithoutVendorInputSchema).optional(),
});

export const VendorUncheckedCreateWithoutVendorcustomersInputSchema: z.ZodType<Prisma.VendorUncheckedCreateWithoutVendorcustomersInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  businessName: z.string().min(2,{message: "Business name must be at least 2 characters long"}),
  businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  product: z.lazy(() => ProductUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
});

export const VendorCreateOrConnectWithoutVendorcustomersInputSchema: z.ZodType<Prisma.VendorCreateOrConnectWithoutVendorcustomersInput> = z.strictObject({
  where: z.lazy(() => VendorWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => VendorCreateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedCreateWithoutVendorcustomersInputSchema) ]),
});

export const UserCreateWithoutVendorcustomersInputSchema: z.ZodType<Prisma.UserCreateWithoutVendorcustomersInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  address: z.string(),
  role: z.lazy(() => RoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendor: z.lazy(() => VendorCreateNestedOneWithoutUserInputSchema).optional(),
  pushToken: z.lazy(() => PushTokenCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutVendorcustomersInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutVendorcustomersInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  address: z.string(),
  role: z.lazy(() => RoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendor: z.lazy(() => VendorUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  pushToken: z.lazy(() => PushTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutVendorcustomersInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutVendorcustomersInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorcustomersInputSchema) ]),
});

export const CustomerSubscriptionCreateWithoutVendorCustomersInputSchema: z.ZodType<Prisma.CustomerSubscriptionCreateWithoutVendorCustomersInput> = z.strictObject({
  id: z.uuid().optional(),
  startDate: z.coerce.date(),
  dailyQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  product: z.lazy(() => ProductCreateNestedOneWithoutSubscriptionInputSchema),
  requests: z.lazy(() => RequestsCreateNestedManyWithoutSubscriptionInputSchema).optional(),
});

export const CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string(),
  startDate: z.coerce.date(),
  dailyQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  requests: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutSubscriptionInputSchema).optional(),
});

export const CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema: z.ZodType<Prisma.CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInput> = z.strictObject({
  where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema) ]),
});

export const CustomerSubscriptionCreateManyVendorCustomersInputEnvelopeSchema: z.ZodType<Prisma.CustomerSubscriptionCreateManyVendorCustomersInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => CustomerSubscriptionCreateManyVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateManyVendorCustomersInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const RequestsCreateWithoutVendorCustomersInputSchema: z.ZodType<Prisma.RequestsCreateWithoutVendorCustomersInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => RequestTypeSchema).optional(),
  message: z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  requestedQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  status: z.lazy(() => StatusSchema).optional(),
  respondedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  product: z.lazy(() => ProductCreateNestedOneWithoutRequestInputSchema),
  subscription: z.lazy(() => CustomerSubscriptionCreateNestedOneWithoutRequestsInputSchema),
});

export const RequestsUncheckedCreateWithoutVendorCustomersInputSchema: z.ZodType<Prisma.RequestsUncheckedCreateWithoutVendorCustomersInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string(),
  subscriptionId: z.string(),
  type: z.lazy(() => RequestTypeSchema).optional(),
  message: z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  requestedQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  status: z.lazy(() => StatusSchema).optional(),
  respondedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const RequestsCreateOrConnectWithoutVendorCustomersInputSchema: z.ZodType<Prisma.RequestsCreateOrConnectWithoutVendorCustomersInput> = z.strictObject({
  where: z.lazy(() => RequestsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema) ]),
});

export const RequestsCreateManyVendorCustomersInputEnvelopeSchema: z.ZodType<Prisma.RequestsCreateManyVendorCustomersInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => RequestsCreateManyVendorCustomersInputSchema), z.lazy(() => RequestsCreateManyVendorCustomersInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const VendorUpsertWithoutVendorcustomersInputSchema: z.ZodType<Prisma.VendorUpsertWithoutVendorcustomersInput> = z.strictObject({
  update: z.union([ z.lazy(() => VendorUpdateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutVendorcustomersInputSchema) ]),
  create: z.union([ z.lazy(() => VendorCreateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedCreateWithoutVendorcustomersInputSchema) ]),
  where: z.lazy(() => VendorWhereInputSchema).optional(),
});

export const VendorUpdateToOneWithWhereWithoutVendorcustomersInputSchema: z.ZodType<Prisma.VendorUpdateToOneWithWhereWithoutVendorcustomersInput> = z.strictObject({
  where: z.lazy(() => VendorWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => VendorUpdateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutVendorcustomersInputSchema) ]),
});

export const VendorUpdateWithoutVendorcustomersInputSchema: z.ZodType<Prisma.VendorUpdateWithoutVendorcustomersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessName: z.union([ z.string().min(2,{message: "Business name must be at least 2 characters long"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessPhone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutVendorNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateManyWithoutVendorNestedInputSchema).optional(),
});

export const VendorUncheckedUpdateWithoutVendorcustomersInputSchema: z.ZodType<Prisma.VendorUncheckedUpdateWithoutVendorcustomersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessName: z.union([ z.string().min(2,{message: "Business name must be at least 2 characters long"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  businessPhone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
});

export const UserUpsertWithoutVendorcustomersInputSchema: z.ZodType<Prisma.UserUpsertWithoutVendorcustomersInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVendorcustomersInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorcustomersInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutVendorcustomersInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutVendorcustomersInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVendorcustomersInputSchema) ]),
});

export const UserUpdateWithoutVendorcustomersInputSchema: z.ZodType<Prisma.UserUpdateWithoutVendorcustomersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(2, { message: "Name must be at least 2 characters long" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendor: z.lazy(() => VendorUpdateOneWithoutUserNestedInputSchema).optional(),
  pushToken: z.lazy(() => PushTokenUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutVendorcustomersInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutVendorcustomersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(2, { message: "Name must be at least 2 characters long" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendor: z.lazy(() => VendorUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  pushToken: z.lazy(() => PushTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const CustomerSubscriptionUpsertWithWhereUniqueWithoutVendorCustomersInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpsertWithWhereUniqueWithoutVendorCustomersInput> = z.strictObject({
  where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CustomerSubscriptionUpdateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutVendorCustomersInputSchema) ]),
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema) ]),
});

export const CustomerSubscriptionUpdateWithWhereUniqueWithoutVendorCustomersInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateWithWhereUniqueWithoutVendorCustomersInput> = z.strictObject({
  where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CustomerSubscriptionUpdateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutVendorCustomersInputSchema) ]),
});

export const CustomerSubscriptionUpdateManyWithWhereWithoutVendorCustomersInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateManyWithWhereWithoutVendorCustomersInput> = z.strictObject({
  where: z.lazy(() => CustomerSubscriptionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CustomerSubscriptionUpdateManyMutationInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersInputSchema) ]),
});

export const RequestsUpsertWithWhereUniqueWithoutVendorCustomersInputSchema: z.ZodType<Prisma.RequestsUpsertWithWhereUniqueWithoutVendorCustomersInput> = z.strictObject({
  where: z.lazy(() => RequestsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => RequestsUpdateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedUpdateWithoutVendorCustomersInputSchema) ]),
  create: z.union([ z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema) ]),
});

export const RequestsUpdateWithWhereUniqueWithoutVendorCustomersInputSchema: z.ZodType<Prisma.RequestsUpdateWithWhereUniqueWithoutVendorCustomersInput> = z.strictObject({
  where: z.lazy(() => RequestsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => RequestsUpdateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedUpdateWithoutVendorCustomersInputSchema) ]),
});

export const RequestsUpdateManyWithWhereWithoutVendorCustomersInputSchema: z.ZodType<Prisma.RequestsUpdateManyWithWhereWithoutVendorCustomersInput> = z.strictObject({
  where: z.lazy(() => RequestsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => RequestsUpdateManyMutationInputSchema), z.lazy(() => RequestsUncheckedUpdateManyWithoutVendorCustomersInputSchema) ]),
});

export const VendorCustomersCreateWithoutSubscriptionInputSchema: z.ZodType<Prisma.VendorCustomersCreateWithoutSubscriptionInput> = z.strictObject({
  id: z.uuid().optional(),
  customerPhone: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendor: z.lazy(() => VendorCreateNestedOneWithoutVendorcustomersInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutVendorcustomersInputSchema),
  request: z.lazy(() => RequestsCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});

export const VendorCustomersUncheckedCreateWithoutSubscriptionInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedCreateWithoutSubscriptionInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorId: z.string(),
  customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  customerPhone: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});

export const VendorCustomersCreateOrConnectWithoutSubscriptionInputSchema: z.ZodType<Prisma.VendorCustomersCreateOrConnectWithoutSubscriptionInput> = z.strictObject({
  where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutSubscriptionInputSchema) ]),
});

export const ProductCreateWithoutSubscriptionInputSchema: z.ZodType<Prisma.ProductCreateWithoutSubscriptionInput> = z.strictObject({
  id: z.uuid().optional(),
  productName: z.string().min(2,{message: "Product name must be of at least 2 characters"}),
  description: z.string().min(2, {message: "Product description must be of at leat 2 characters"}),
  unit: z.lazy(() => ProductUnitSchema),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendor: z.lazy(() => VendorCreateNestedOneWithoutProductInputSchema),
  request: z.lazy(() => RequestsCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateWithoutSubscriptionInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutSubscriptionInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorId: z.string(),
  productName: z.string().min(2,{message: "Product name must be of at least 2 characters"}),
  description: z.string().min(2, {message: "Product description must be of at leat 2 characters"}),
  unit: z.lazy(() => ProductUnitSchema),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductCreateOrConnectWithoutSubscriptionInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutSubscriptionInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSubscriptionInputSchema) ]),
});

export const RequestsCreateWithoutSubscriptionInputSchema: z.ZodType<Prisma.RequestsCreateWithoutSubscriptionInput> = z.strictObject({
  id: z.uuid().optional(),
  type: z.lazy(() => RequestTypeSchema).optional(),
  message: z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  requestedQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  status: z.lazy(() => StatusSchema).optional(),
  respondedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendorCustomers: z.lazy(() => VendorCustomersCreateNestedOneWithoutRequestInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutRequestInputSchema),
});

export const RequestsUncheckedCreateWithoutSubscriptionInputSchema: z.ZodType<Prisma.RequestsUncheckedCreateWithoutSubscriptionInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorCustomerId: z.string(),
  productId: z.string(),
  type: z.lazy(() => RequestTypeSchema).optional(),
  message: z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  requestedQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  status: z.lazy(() => StatusSchema).optional(),
  respondedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const RequestsCreateOrConnectWithoutSubscriptionInputSchema: z.ZodType<Prisma.RequestsCreateOrConnectWithoutSubscriptionInput> = z.strictObject({
  where: z.lazy(() => RequestsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema) ]),
});

export const RequestsCreateManySubscriptionInputEnvelopeSchema: z.ZodType<Prisma.RequestsCreateManySubscriptionInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => RequestsCreateManySubscriptionInputSchema), z.lazy(() => RequestsCreateManySubscriptionInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const VendorCustomersUpsertWithoutSubscriptionInputSchema: z.ZodType<Prisma.VendorCustomersUpsertWithoutSubscriptionInput> = z.strictObject({
  update: z.union([ z.lazy(() => VendorCustomersUpdateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutSubscriptionInputSchema) ]),
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutSubscriptionInputSchema) ]),
  where: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
});

export const VendorCustomersUpdateToOneWithWhereWithoutSubscriptionInputSchema: z.ZodType<Prisma.VendorCustomersUpdateToOneWithWhereWithoutSubscriptionInput> = z.strictObject({
  where: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => VendorCustomersUpdateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutSubscriptionInputSchema) ]),
});

export const VendorCustomersUpdateWithoutSubscriptionInputSchema: z.ZodType<Prisma.VendorCustomersUpdateWithoutSubscriptionInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendor: z.lazy(() => VendorUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
  request: z.lazy(() => RequestsUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});

export const VendorCustomersUncheckedUpdateWithoutSubscriptionInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedUpdateWithoutSubscriptionInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  request: z.lazy(() => RequestsUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});

export const ProductUpsertWithoutSubscriptionInputSchema: z.ZodType<Prisma.ProductUpsertWithoutSubscriptionInput> = z.strictObject({
  update: z.union([ z.lazy(() => ProductUpdateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutSubscriptionInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSubscriptionInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional(),
});

export const ProductUpdateToOneWithWhereWithoutSubscriptionInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutSubscriptionInput> = z.strictObject({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutSubscriptionInputSchema) ]),
});

export const ProductUpdateWithoutSubscriptionInputSchema: z.ZodType<Prisma.ProductUpdateWithoutSubscriptionInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string().min(2,{message: "Product name must be of at least 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string().min(2, {message: "Product description must be of at leat 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendor: z.lazy(() => VendorUpdateOneRequiredWithoutProductNestedInputSchema).optional(),
  request: z.lazy(() => RequestsUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateWithoutSubscriptionInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutSubscriptionInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string().min(2,{message: "Product name must be of at least 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string().min(2, {message: "Product description must be of at leat 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  request: z.lazy(() => RequestsUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const RequestsUpsertWithWhereUniqueWithoutSubscriptionInputSchema: z.ZodType<Prisma.RequestsUpsertWithWhereUniqueWithoutSubscriptionInput> = z.strictObject({
  where: z.lazy(() => RequestsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => RequestsUpdateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedUpdateWithoutSubscriptionInputSchema) ]),
  create: z.union([ z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema) ]),
});

export const RequestsUpdateWithWhereUniqueWithoutSubscriptionInputSchema: z.ZodType<Prisma.RequestsUpdateWithWhereUniqueWithoutSubscriptionInput> = z.strictObject({
  where: z.lazy(() => RequestsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => RequestsUpdateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedUpdateWithoutSubscriptionInputSchema) ]),
});

export const RequestsUpdateManyWithWhereWithoutSubscriptionInputSchema: z.ZodType<Prisma.RequestsUpdateManyWithWhereWithoutSubscriptionInput> = z.strictObject({
  where: z.lazy(() => RequestsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => RequestsUpdateManyMutationInputSchema), z.lazy(() => RequestsUncheckedUpdateManyWithoutSubscriptionInputSchema) ]),
});

export const VendorCustomersCreateWithoutRequestInputSchema: z.ZodType<Prisma.VendorCustomersCreateWithoutRequestInput> = z.strictObject({
  id: z.uuid().optional(),
  customerPhone: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendor: z.lazy(() => VendorCreateNestedOneWithoutVendorcustomersInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutVendorcustomersInputSchema),
  subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});

export const VendorCustomersUncheckedCreateWithoutRequestInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedCreateWithoutRequestInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorId: z.string(),
  customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  customerPhone: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});

export const VendorCustomersCreateOrConnectWithoutRequestInputSchema: z.ZodType<Prisma.VendorCustomersCreateOrConnectWithoutRequestInput> = z.strictObject({
  where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutRequestInputSchema) ]),
});

export const ProductCreateWithoutRequestInputSchema: z.ZodType<Prisma.ProductCreateWithoutRequestInput> = z.strictObject({
  id: z.uuid().optional(),
  productName: z.string().min(2,{message: "Product name must be of at least 2 characters"}),
  description: z.string().min(2, {message: "Product description must be of at leat 2 characters"}),
  unit: z.lazy(() => ProductUnitSchema),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendor: z.lazy(() => VendorCreateNestedOneWithoutProductInputSchema),
  subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateWithoutRequestInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutRequestInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorId: z.string(),
  productName: z.string().min(2,{message: "Product name must be of at least 2 characters"}),
  description: z.string().min(2, {message: "Product description must be of at leat 2 characters"}),
  unit: z.lazy(() => ProductUnitSchema),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductCreateOrConnectWithoutRequestInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutRequestInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedCreateWithoutRequestInputSchema) ]),
});

export const CustomerSubscriptionCreateWithoutRequestsInputSchema: z.ZodType<Prisma.CustomerSubscriptionCreateWithoutRequestsInput> = z.strictObject({
  id: z.uuid().optional(),
  startDate: z.coerce.date(),
  dailyQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendorCustomers: z.lazy(() => VendorCustomersCreateNestedOneWithoutSubscriptionInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutSubscriptionInputSchema),
});

export const CustomerSubscriptionUncheckedCreateWithoutRequestsInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedCreateWithoutRequestsInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorCustomerId: z.string(),
  productId: z.string(),
  startDate: z.coerce.date(),
  dailyQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CustomerSubscriptionCreateOrConnectWithoutRequestsInputSchema: z.ZodType<Prisma.CustomerSubscriptionCreateOrConnectWithoutRequestsInput> = z.strictObject({
  where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutRequestsInputSchema) ]),
});

export const VendorCustomersUpsertWithoutRequestInputSchema: z.ZodType<Prisma.VendorCustomersUpsertWithoutRequestInput> = z.strictObject({
  update: z.union([ z.lazy(() => VendorCustomersUpdateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutRequestInputSchema) ]),
  create: z.union([ z.lazy(() => VendorCustomersCreateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutRequestInputSchema) ]),
  where: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
});

export const VendorCustomersUpdateToOneWithWhereWithoutRequestInputSchema: z.ZodType<Prisma.VendorCustomersUpdateToOneWithWhereWithoutRequestInput> = z.strictObject({
  where: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => VendorCustomersUpdateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutRequestInputSchema) ]),
});

export const VendorCustomersUpdateWithoutRequestInputSchema: z.ZodType<Prisma.VendorCustomersUpdateWithoutRequestInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendor: z.lazy(() => VendorUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});

export const VendorCustomersUncheckedUpdateWithoutRequestInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedUpdateWithoutRequestInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});

export const ProductUpsertWithoutRequestInputSchema: z.ZodType<Prisma.ProductUpsertWithoutRequestInput> = z.strictObject({
  update: z.union([ z.lazy(() => ProductUpdateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutRequestInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedCreateWithoutRequestInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional(),
});

export const ProductUpdateToOneWithWhereWithoutRequestInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutRequestInput> = z.strictObject({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutRequestInputSchema) ]),
});

export const ProductUpdateWithoutRequestInputSchema: z.ZodType<Prisma.ProductUpdateWithoutRequestInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string().min(2,{message: "Product name must be of at least 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string().min(2, {message: "Product description must be of at leat 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendor: z.lazy(() => VendorUpdateOneRequiredWithoutProductNestedInputSchema).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateWithoutRequestInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutRequestInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string().min(2,{message: "Product name must be of at least 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string().min(2, {message: "Product description must be of at leat 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const CustomerSubscriptionUpsertWithoutRequestsInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpsertWithoutRequestsInput> = z.strictObject({
  update: z.union([ z.lazy(() => CustomerSubscriptionUpdateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutRequestsInputSchema) ]),
  create: z.union([ z.lazy(() => CustomerSubscriptionCreateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutRequestsInputSchema) ]),
  where: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
});

export const CustomerSubscriptionUpdateToOneWithWhereWithoutRequestsInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateToOneWithWhereWithoutRequestsInput> = z.strictObject({
  where: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CustomerSubscriptionUpdateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutRequestsInputSchema) ]),
});

export const CustomerSubscriptionUpdateWithoutRequestsInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateWithoutRequestsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  dailyQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomers: z.lazy(() => VendorCustomersUpdateOneRequiredWithoutSubscriptionNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutSubscriptionNestedInputSchema).optional(),
});

export const CustomerSubscriptionUncheckedUpdateWithoutRequestsInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedUpdateWithoutRequestsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  dailyQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const UserCreateWithoutPushTokenInputSchema: z.ZodType<Prisma.UserCreateWithoutPushTokenInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  address: z.string(),
  role: z.lazy(() => RoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendor: z.lazy(() => VendorCreateNestedOneWithoutUserInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutPushTokenInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutPushTokenInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  address: z.string(),
  role: z.lazy(() => RoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  vendor: z.lazy(() => VendorUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutPushTokenInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutPushTokenInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedCreateWithoutPushTokenInputSchema) ]),
});

export const UserUpsertWithoutPushTokenInputSchema: z.ZodType<Prisma.UserUpsertWithoutPushTokenInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedUpdateWithoutPushTokenInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedCreateWithoutPushTokenInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutPushTokenInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutPushTokenInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedUpdateWithoutPushTokenInputSchema) ]),
});

export const UserUpdateWithoutPushTokenInputSchema: z.ZodType<Prisma.UserUpdateWithoutPushTokenInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(2, { message: "Name must be at least 2 characters long" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendor: z.lazy(() => VendorUpdateOneWithoutUserNestedInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutPushTokenInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutPushTokenInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string().min(2, { message: "Name must be at least 2 characters long" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendor: z.lazy(() => VendorUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  vendorcustomers: z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const VendorCustomersCreateManyUserInputSchema: z.ZodType<Prisma.VendorCustomersCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorId: z.string(),
  customerPhone: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const PushTokenCreateManyUserInputSchema: z.ZodType<Prisma.PushTokenCreateManyUserInput> = z.strictObject({
  id: z.cuid().optional(),
  token: z.string(),
  platform: z.lazy(() => PlatformSchema),
  createdAt: z.coerce.date().optional(),
});

export const VendorCustomersUpdateWithoutUserInputSchema: z.ZodType<Prisma.VendorCustomersUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendor: z.lazy(() => VendorUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
  request: z.lazy(() => RequestsUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});

export const VendorCustomersUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
  request: z.lazy(() => RequestsUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});

export const VendorCustomersUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PushTokenUpdateWithoutUserInputSchema: z.ZodType<Prisma.PushTokenUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  platform: z.union([ z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PushTokenUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.PushTokenUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  platform: z.union([ z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PushTokenUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.PushTokenUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  platform: z.union([ z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const ProductCreateManyVendorInputSchema: z.ZodType<Prisma.ProductCreateManyVendorInput> = z.strictObject({
  id: z.uuid().optional(),
  productName: z.string().min(2,{message: "Product name must be of at least 2 characters"}),
  description: z.string().min(2, {message: "Product description must be of at leat 2 characters"}),
  unit: z.lazy(() => ProductUnitSchema),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const VendorCustomersCreateManyVendorInputSchema: z.ZodType<Prisma.VendorCustomersCreateManyVendorInput> = z.strictObject({
  id: z.uuid().optional(),
  customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
  customerPhone: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const ProductUpdateWithoutVendorInputSchema: z.ZodType<Prisma.ProductUpdateWithoutVendorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string().min(2,{message: "Product name must be of at least 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string().min(2, {message: "Product description must be of at leat 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutProductNestedInputSchema).optional(),
  request: z.lazy(() => RequestsUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateWithoutVendorInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutVendorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string().min(2,{message: "Product name must be of at least 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string().min(2, {message: "Product description must be of at leat 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  request: z.lazy(() => RequestsUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateManyWithoutVendorInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutVendorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string().min(2,{message: "Product name must be of at least 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string().min(2, {message: "Product description must be of at leat 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  unit: z.union([ z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const VendorCustomersUpdateWithoutVendorInputSchema: z.ZodType<Prisma.VendorCustomersUpdateWithoutVendorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
  request: z.lazy(() => RequestsUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});

export const VendorCustomersUncheckedUpdateWithoutVendorInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedUpdateWithoutVendorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
  request: z.lazy(() => RequestsUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});

export const VendorCustomersUncheckedUpdateManyWithoutVendorInputSchema: z.ZodType<Prisma.VendorCustomersUncheckedUpdateManyWithoutVendorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  customerPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CustomerSubscriptionCreateManyProductInputSchema: z.ZodType<Prisma.CustomerSubscriptionCreateManyProductInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorCustomerId: z.string(),
  startDate: z.coerce.date(),
  dailyQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const RequestsCreateManyProductInputSchema: z.ZodType<Prisma.RequestsCreateManyProductInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorCustomerId: z.string(),
  subscriptionId: z.string(),
  type: z.lazy(() => RequestTypeSchema).optional(),
  message: z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  requestedQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  status: z.lazy(() => StatusSchema).optional(),
  respondedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CustomerSubscriptionUpdateWithoutProductInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  dailyQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomers: z.lazy(() => VendorCustomersUpdateOneRequiredWithoutSubscriptionNestedInputSchema).optional(),
  requests: z.lazy(() => RequestsUpdateManyWithoutSubscriptionNestedInputSchema).optional(),
});

export const CustomerSubscriptionUncheckedUpdateWithoutProductInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  dailyQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requests: z.lazy(() => RequestsUncheckedUpdateManyWithoutSubscriptionNestedInputSchema).optional(),
});

export const CustomerSubscriptionUncheckedUpdateManyWithoutProductInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedUpdateManyWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  dailyQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const RequestsUpdateWithoutProductInputSchema: z.ZodType<Prisma.RequestsUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  start_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  end_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requestedQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  respondedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomers: z.lazy(() => VendorCustomersUpdateOneRequiredWithoutRequestNestedInputSchema).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUpdateOneRequiredWithoutRequestsNestedInputSchema).optional(),
});

export const RequestsUncheckedUpdateWithoutProductInputSchema: z.ZodType<Prisma.RequestsUncheckedUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  start_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  end_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requestedQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  respondedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const RequestsUncheckedUpdateManyWithoutProductInputSchema: z.ZodType<Prisma.RequestsUncheckedUpdateManyWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  start_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  end_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requestedQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  respondedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CustomerSubscriptionCreateManyVendorCustomersInputSchema: z.ZodType<Prisma.CustomerSubscriptionCreateManyVendorCustomersInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string(),
  startDate: z.coerce.date(),
  dailyQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const RequestsCreateManyVendorCustomersInputSchema: z.ZodType<Prisma.RequestsCreateManyVendorCustomersInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string(),
  subscriptionId: z.string(),
  type: z.lazy(() => RequestTypeSchema).optional(),
  message: z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  requestedQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  status: z.lazy(() => StatusSchema).optional(),
  respondedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CustomerSubscriptionUpdateWithoutVendorCustomersInputSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateWithoutVendorCustomersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  dailyQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutSubscriptionNestedInputSchema).optional(),
  requests: z.lazy(() => RequestsUpdateManyWithoutSubscriptionNestedInputSchema).optional(),
});

export const CustomerSubscriptionUncheckedUpdateWithoutVendorCustomersInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedUpdateWithoutVendorCustomersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  dailyQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requests: z.lazy(() => RequestsUncheckedUpdateManyWithoutSubscriptionNestedInputSchema).optional(),
});

export const CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersInputSchema: z.ZodType<Prisma.CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  dailyQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const RequestsUpdateWithoutVendorCustomersInputSchema: z.ZodType<Prisma.RequestsUpdateWithoutVendorCustomersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  start_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  end_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requestedQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  respondedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutRequestNestedInputSchema).optional(),
  subscription: z.lazy(() => CustomerSubscriptionUpdateOneRequiredWithoutRequestsNestedInputSchema).optional(),
});

export const RequestsUncheckedUpdateWithoutVendorCustomersInputSchema: z.ZodType<Prisma.RequestsUncheckedUpdateWithoutVendorCustomersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  start_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  end_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requestedQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  respondedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const RequestsUncheckedUpdateManyWithoutVendorCustomersInputSchema: z.ZodType<Prisma.RequestsUncheckedUpdateManyWithoutVendorCustomersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  start_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  end_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requestedQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  respondedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const RequestsCreateManySubscriptionInputSchema: z.ZodType<Prisma.RequestsCreateManySubscriptionInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorCustomerId: z.string(),
  productId: z.string(),
  type: z.lazy(() => RequestTypeSchema).optional(),
  message: z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  requestedQuantity: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  status: z.lazy(() => StatusSchema).optional(),
  respondedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const RequestsUpdateWithoutSubscriptionInputSchema: z.ZodType<Prisma.RequestsUpdateWithoutSubscriptionInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  start_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  end_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requestedQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  respondedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomers: z.lazy(() => VendorCustomersUpdateOneRequiredWithoutRequestNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutRequestNestedInputSchema).optional(),
});

export const RequestsUncheckedUpdateWithoutSubscriptionInputSchema: z.ZodType<Prisma.RequestsUncheckedUpdateWithoutSubscriptionInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  start_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  end_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requestedQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  respondedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const RequestsUncheckedUpdateManyWithoutSubscriptionInputSchema: z.ZodType<Prisma.RequestsUncheckedUpdateManyWithoutSubscriptionInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorCustomerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string().min(2,{message: "Message should be at least 2 of 2 characters"}),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  start_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  end_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  requestedQuantity: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  respondedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(), UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(), 
  having: UserScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const VendorFindFirstArgsSchema: z.ZodType<Prisma.VendorFindFirstArgs> = z.object({
  select: VendorSelectSchema.optional(),
  include: VendorIncludeSchema.optional(),
  where: VendorWhereInputSchema.optional(), 
  orderBy: z.union([ VendorOrderByWithRelationInputSchema.array(), VendorOrderByWithRelationInputSchema ]).optional(),
  cursor: VendorWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VendorScalarFieldEnumSchema, VendorScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VendorFindFirstOrThrowArgsSchema: z.ZodType<Prisma.VendorFindFirstOrThrowArgs> = z.object({
  select: VendorSelectSchema.optional(),
  include: VendorIncludeSchema.optional(),
  where: VendorWhereInputSchema.optional(), 
  orderBy: z.union([ VendorOrderByWithRelationInputSchema.array(), VendorOrderByWithRelationInputSchema ]).optional(),
  cursor: VendorWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VendorScalarFieldEnumSchema, VendorScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VendorFindManyArgsSchema: z.ZodType<Prisma.VendorFindManyArgs> = z.object({
  select: VendorSelectSchema.optional(),
  include: VendorIncludeSchema.optional(),
  where: VendorWhereInputSchema.optional(), 
  orderBy: z.union([ VendorOrderByWithRelationInputSchema.array(), VendorOrderByWithRelationInputSchema ]).optional(),
  cursor: VendorWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VendorScalarFieldEnumSchema, VendorScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VendorAggregateArgsSchema: z.ZodType<Prisma.VendorAggregateArgs> = z.object({
  where: VendorWhereInputSchema.optional(), 
  orderBy: z.union([ VendorOrderByWithRelationInputSchema.array(), VendorOrderByWithRelationInputSchema ]).optional(),
  cursor: VendorWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const VendorGroupByArgsSchema: z.ZodType<Prisma.VendorGroupByArgs> = z.object({
  where: VendorWhereInputSchema.optional(), 
  orderBy: z.union([ VendorOrderByWithAggregationInputSchema.array(), VendorOrderByWithAggregationInputSchema ]).optional(),
  by: VendorScalarFieldEnumSchema.array(), 
  having: VendorScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const VendorFindUniqueArgsSchema: z.ZodType<Prisma.VendorFindUniqueArgs> = z.object({
  select: VendorSelectSchema.optional(),
  include: VendorIncludeSchema.optional(),
  where: VendorWhereUniqueInputSchema, 
}).strict();

export const VendorFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.VendorFindUniqueOrThrowArgs> = z.object({
  select: VendorSelectSchema.optional(),
  include: VendorIncludeSchema.optional(),
  where: VendorWhereUniqueInputSchema, 
}).strict();

export const ProductFindFirstArgsSchema: z.ZodType<Prisma.ProductFindFirstArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereInputSchema.optional(), 
  orderBy: z.union([ ProductOrderByWithRelationInputSchema.array(), ProductOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductScalarFieldEnumSchema, ProductScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ProductFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ProductFindFirstOrThrowArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereInputSchema.optional(), 
  orderBy: z.union([ ProductOrderByWithRelationInputSchema.array(), ProductOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductScalarFieldEnumSchema, ProductScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ProductFindManyArgsSchema: z.ZodType<Prisma.ProductFindManyArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereInputSchema.optional(), 
  orderBy: z.union([ ProductOrderByWithRelationInputSchema.array(), ProductOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductScalarFieldEnumSchema, ProductScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ProductAggregateArgsSchema: z.ZodType<Prisma.ProductAggregateArgs> = z.object({
  where: ProductWhereInputSchema.optional(), 
  orderBy: z.union([ ProductOrderByWithRelationInputSchema.array(), ProductOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const ProductGroupByArgsSchema: z.ZodType<Prisma.ProductGroupByArgs> = z.object({
  where: ProductWhereInputSchema.optional(), 
  orderBy: z.union([ ProductOrderByWithAggregationInputSchema.array(), ProductOrderByWithAggregationInputSchema ]).optional(),
  by: ProductScalarFieldEnumSchema.array(), 
  having: ProductScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const ProductFindUniqueArgsSchema: z.ZodType<Prisma.ProductFindUniqueArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereUniqueInputSchema, 
}).strict();

export const ProductFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ProductFindUniqueOrThrowArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereUniqueInputSchema, 
}).strict();

export const VendorCustomersFindFirstArgsSchema: z.ZodType<Prisma.VendorCustomersFindFirstArgs> = z.object({
  select: VendorCustomersSelectSchema.optional(),
  include: VendorCustomersIncludeSchema.optional(),
  where: VendorCustomersWhereInputSchema.optional(), 
  orderBy: z.union([ VendorCustomersOrderByWithRelationInputSchema.array(), VendorCustomersOrderByWithRelationInputSchema ]).optional(),
  cursor: VendorCustomersWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VendorCustomersScalarFieldEnumSchema, VendorCustomersScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VendorCustomersFindFirstOrThrowArgsSchema: z.ZodType<Prisma.VendorCustomersFindFirstOrThrowArgs> = z.object({
  select: VendorCustomersSelectSchema.optional(),
  include: VendorCustomersIncludeSchema.optional(),
  where: VendorCustomersWhereInputSchema.optional(), 
  orderBy: z.union([ VendorCustomersOrderByWithRelationInputSchema.array(), VendorCustomersOrderByWithRelationInputSchema ]).optional(),
  cursor: VendorCustomersWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VendorCustomersScalarFieldEnumSchema, VendorCustomersScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VendorCustomersFindManyArgsSchema: z.ZodType<Prisma.VendorCustomersFindManyArgs> = z.object({
  select: VendorCustomersSelectSchema.optional(),
  include: VendorCustomersIncludeSchema.optional(),
  where: VendorCustomersWhereInputSchema.optional(), 
  orderBy: z.union([ VendorCustomersOrderByWithRelationInputSchema.array(), VendorCustomersOrderByWithRelationInputSchema ]).optional(),
  cursor: VendorCustomersWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VendorCustomersScalarFieldEnumSchema, VendorCustomersScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VendorCustomersAggregateArgsSchema: z.ZodType<Prisma.VendorCustomersAggregateArgs> = z.object({
  where: VendorCustomersWhereInputSchema.optional(), 
  orderBy: z.union([ VendorCustomersOrderByWithRelationInputSchema.array(), VendorCustomersOrderByWithRelationInputSchema ]).optional(),
  cursor: VendorCustomersWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const VendorCustomersGroupByArgsSchema: z.ZodType<Prisma.VendorCustomersGroupByArgs> = z.object({
  where: VendorCustomersWhereInputSchema.optional(), 
  orderBy: z.union([ VendorCustomersOrderByWithAggregationInputSchema.array(), VendorCustomersOrderByWithAggregationInputSchema ]).optional(),
  by: VendorCustomersScalarFieldEnumSchema.array(), 
  having: VendorCustomersScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const VendorCustomersFindUniqueArgsSchema: z.ZodType<Prisma.VendorCustomersFindUniqueArgs> = z.object({
  select: VendorCustomersSelectSchema.optional(),
  include: VendorCustomersIncludeSchema.optional(),
  where: VendorCustomersWhereUniqueInputSchema, 
}).strict();

export const VendorCustomersFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.VendorCustomersFindUniqueOrThrowArgs> = z.object({
  select: VendorCustomersSelectSchema.optional(),
  include: VendorCustomersIncludeSchema.optional(),
  where: VendorCustomersWhereUniqueInputSchema, 
}).strict();

export const CustomerSubscriptionFindFirstArgsSchema: z.ZodType<Prisma.CustomerSubscriptionFindFirstArgs> = z.object({
  select: CustomerSubscriptionSelectSchema.optional(),
  include: CustomerSubscriptionIncludeSchema.optional(),
  where: CustomerSubscriptionWhereInputSchema.optional(), 
  orderBy: z.union([ CustomerSubscriptionOrderByWithRelationInputSchema.array(), CustomerSubscriptionOrderByWithRelationInputSchema ]).optional(),
  cursor: CustomerSubscriptionWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CustomerSubscriptionScalarFieldEnumSchema, CustomerSubscriptionScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CustomerSubscriptionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CustomerSubscriptionFindFirstOrThrowArgs> = z.object({
  select: CustomerSubscriptionSelectSchema.optional(),
  include: CustomerSubscriptionIncludeSchema.optional(),
  where: CustomerSubscriptionWhereInputSchema.optional(), 
  orderBy: z.union([ CustomerSubscriptionOrderByWithRelationInputSchema.array(), CustomerSubscriptionOrderByWithRelationInputSchema ]).optional(),
  cursor: CustomerSubscriptionWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CustomerSubscriptionScalarFieldEnumSchema, CustomerSubscriptionScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CustomerSubscriptionFindManyArgsSchema: z.ZodType<Prisma.CustomerSubscriptionFindManyArgs> = z.object({
  select: CustomerSubscriptionSelectSchema.optional(),
  include: CustomerSubscriptionIncludeSchema.optional(),
  where: CustomerSubscriptionWhereInputSchema.optional(), 
  orderBy: z.union([ CustomerSubscriptionOrderByWithRelationInputSchema.array(), CustomerSubscriptionOrderByWithRelationInputSchema ]).optional(),
  cursor: CustomerSubscriptionWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CustomerSubscriptionScalarFieldEnumSchema, CustomerSubscriptionScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CustomerSubscriptionAggregateArgsSchema: z.ZodType<Prisma.CustomerSubscriptionAggregateArgs> = z.object({
  where: CustomerSubscriptionWhereInputSchema.optional(), 
  orderBy: z.union([ CustomerSubscriptionOrderByWithRelationInputSchema.array(), CustomerSubscriptionOrderByWithRelationInputSchema ]).optional(),
  cursor: CustomerSubscriptionWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CustomerSubscriptionGroupByArgsSchema: z.ZodType<Prisma.CustomerSubscriptionGroupByArgs> = z.object({
  where: CustomerSubscriptionWhereInputSchema.optional(), 
  orderBy: z.union([ CustomerSubscriptionOrderByWithAggregationInputSchema.array(), CustomerSubscriptionOrderByWithAggregationInputSchema ]).optional(),
  by: CustomerSubscriptionScalarFieldEnumSchema.array(), 
  having: CustomerSubscriptionScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CustomerSubscriptionFindUniqueArgsSchema: z.ZodType<Prisma.CustomerSubscriptionFindUniqueArgs> = z.object({
  select: CustomerSubscriptionSelectSchema.optional(),
  include: CustomerSubscriptionIncludeSchema.optional(),
  where: CustomerSubscriptionWhereUniqueInputSchema, 
}).strict();

export const CustomerSubscriptionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CustomerSubscriptionFindUniqueOrThrowArgs> = z.object({
  select: CustomerSubscriptionSelectSchema.optional(),
  include: CustomerSubscriptionIncludeSchema.optional(),
  where: CustomerSubscriptionWhereUniqueInputSchema, 
}).strict();

export const RequestsFindFirstArgsSchema: z.ZodType<Prisma.RequestsFindFirstArgs> = z.object({
  select: RequestsSelectSchema.optional(),
  include: RequestsIncludeSchema.optional(),
  where: RequestsWhereInputSchema.optional(), 
  orderBy: z.union([ RequestsOrderByWithRelationInputSchema.array(), RequestsOrderByWithRelationInputSchema ]).optional(),
  cursor: RequestsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RequestsScalarFieldEnumSchema, RequestsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const RequestsFindFirstOrThrowArgsSchema: z.ZodType<Prisma.RequestsFindFirstOrThrowArgs> = z.object({
  select: RequestsSelectSchema.optional(),
  include: RequestsIncludeSchema.optional(),
  where: RequestsWhereInputSchema.optional(), 
  orderBy: z.union([ RequestsOrderByWithRelationInputSchema.array(), RequestsOrderByWithRelationInputSchema ]).optional(),
  cursor: RequestsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RequestsScalarFieldEnumSchema, RequestsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const RequestsFindManyArgsSchema: z.ZodType<Prisma.RequestsFindManyArgs> = z.object({
  select: RequestsSelectSchema.optional(),
  include: RequestsIncludeSchema.optional(),
  where: RequestsWhereInputSchema.optional(), 
  orderBy: z.union([ RequestsOrderByWithRelationInputSchema.array(), RequestsOrderByWithRelationInputSchema ]).optional(),
  cursor: RequestsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RequestsScalarFieldEnumSchema, RequestsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const RequestsAggregateArgsSchema: z.ZodType<Prisma.RequestsAggregateArgs> = z.object({
  where: RequestsWhereInputSchema.optional(), 
  orderBy: z.union([ RequestsOrderByWithRelationInputSchema.array(), RequestsOrderByWithRelationInputSchema ]).optional(),
  cursor: RequestsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const RequestsGroupByArgsSchema: z.ZodType<Prisma.RequestsGroupByArgs> = z.object({
  where: RequestsWhereInputSchema.optional(), 
  orderBy: z.union([ RequestsOrderByWithAggregationInputSchema.array(), RequestsOrderByWithAggregationInputSchema ]).optional(),
  by: RequestsScalarFieldEnumSchema.array(), 
  having: RequestsScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const RequestsFindUniqueArgsSchema: z.ZodType<Prisma.RequestsFindUniqueArgs> = z.object({
  select: RequestsSelectSchema.optional(),
  include: RequestsIncludeSchema.optional(),
  where: RequestsWhereUniqueInputSchema, 
}).strict();

export const RequestsFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.RequestsFindUniqueOrThrowArgs> = z.object({
  select: RequestsSelectSchema.optional(),
  include: RequestsIncludeSchema.optional(),
  where: RequestsWhereUniqueInputSchema, 
}).strict();

export const PushTokenFindFirstArgsSchema: z.ZodType<Prisma.PushTokenFindFirstArgs> = z.object({
  select: PushTokenSelectSchema.optional(),
  include: PushTokenIncludeSchema.optional(),
  where: PushTokenWhereInputSchema.optional(), 
  orderBy: z.union([ PushTokenOrderByWithRelationInputSchema.array(), PushTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: PushTokenWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PushTokenScalarFieldEnumSchema, PushTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PushTokenFindFirstOrThrowArgsSchema: z.ZodType<Prisma.PushTokenFindFirstOrThrowArgs> = z.object({
  select: PushTokenSelectSchema.optional(),
  include: PushTokenIncludeSchema.optional(),
  where: PushTokenWhereInputSchema.optional(), 
  orderBy: z.union([ PushTokenOrderByWithRelationInputSchema.array(), PushTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: PushTokenWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PushTokenScalarFieldEnumSchema, PushTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PushTokenFindManyArgsSchema: z.ZodType<Prisma.PushTokenFindManyArgs> = z.object({
  select: PushTokenSelectSchema.optional(),
  include: PushTokenIncludeSchema.optional(),
  where: PushTokenWhereInputSchema.optional(), 
  orderBy: z.union([ PushTokenOrderByWithRelationInputSchema.array(), PushTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: PushTokenWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PushTokenScalarFieldEnumSchema, PushTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PushTokenAggregateArgsSchema: z.ZodType<Prisma.PushTokenAggregateArgs> = z.object({
  where: PushTokenWhereInputSchema.optional(), 
  orderBy: z.union([ PushTokenOrderByWithRelationInputSchema.array(), PushTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: PushTokenWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const PushTokenGroupByArgsSchema: z.ZodType<Prisma.PushTokenGroupByArgs> = z.object({
  where: PushTokenWhereInputSchema.optional(), 
  orderBy: z.union([ PushTokenOrderByWithAggregationInputSchema.array(), PushTokenOrderByWithAggregationInputSchema ]).optional(),
  by: PushTokenScalarFieldEnumSchema.array(), 
  having: PushTokenScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const PushTokenFindUniqueArgsSchema: z.ZodType<Prisma.PushTokenFindUniqueArgs> = z.object({
  select: PushTokenSelectSchema.optional(),
  include: PushTokenIncludeSchema.optional(),
  where: PushTokenWhereUniqueInputSchema, 
}).strict();

export const PushTokenFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.PushTokenFindUniqueOrThrowArgs> = z.object({
  select: PushTokenSelectSchema.optional(),
  include: PushTokenIncludeSchema.optional(),
  where: PushTokenWhereUniqueInputSchema, 
}).strict();

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema, UserUncheckedCreateInputSchema ]),
}).strict();

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
  create: z.union([ UserCreateInputSchema, UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema, UserUncheckedUpdateInputSchema ]),
}).strict();

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema, UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema, UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema, UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UserUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserUpdateManyAndReturnArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VendorCreateArgsSchema: z.ZodType<Prisma.VendorCreateArgs> = z.object({
  select: VendorSelectSchema.optional(),
  include: VendorIncludeSchema.optional(),
  data: z.union([ VendorCreateInputSchema, VendorUncheckedCreateInputSchema ]),
}).strict();

export const VendorUpsertArgsSchema: z.ZodType<Prisma.VendorUpsertArgs> = z.object({
  select: VendorSelectSchema.optional(),
  include: VendorIncludeSchema.optional(),
  where: VendorWhereUniqueInputSchema, 
  create: z.union([ VendorCreateInputSchema, VendorUncheckedCreateInputSchema ]),
  update: z.union([ VendorUpdateInputSchema, VendorUncheckedUpdateInputSchema ]),
}).strict();

export const VendorCreateManyArgsSchema: z.ZodType<Prisma.VendorCreateManyArgs> = z.object({
  data: z.union([ VendorCreateManyInputSchema, VendorCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const VendorCreateManyAndReturnArgsSchema: z.ZodType<Prisma.VendorCreateManyAndReturnArgs> = z.object({
  data: z.union([ VendorCreateManyInputSchema, VendorCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const VendorDeleteArgsSchema: z.ZodType<Prisma.VendorDeleteArgs> = z.object({
  select: VendorSelectSchema.optional(),
  include: VendorIncludeSchema.optional(),
  where: VendorWhereUniqueInputSchema, 
}).strict();

export const VendorUpdateArgsSchema: z.ZodType<Prisma.VendorUpdateArgs> = z.object({
  select: VendorSelectSchema.optional(),
  include: VendorIncludeSchema.optional(),
  data: z.union([ VendorUpdateInputSchema, VendorUncheckedUpdateInputSchema ]),
  where: VendorWhereUniqueInputSchema, 
}).strict();

export const VendorUpdateManyArgsSchema: z.ZodType<Prisma.VendorUpdateManyArgs> = z.object({
  data: z.union([ VendorUpdateManyMutationInputSchema, VendorUncheckedUpdateManyInputSchema ]),
  where: VendorWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VendorUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.VendorUpdateManyAndReturnArgs> = z.object({
  data: z.union([ VendorUpdateManyMutationInputSchema, VendorUncheckedUpdateManyInputSchema ]),
  where: VendorWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VendorDeleteManyArgsSchema: z.ZodType<Prisma.VendorDeleteManyArgs> = z.object({
  where: VendorWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ProductCreateArgsSchema: z.ZodType<Prisma.ProductCreateArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  data: z.union([ ProductCreateInputSchema, ProductUncheckedCreateInputSchema ]),
}).strict();

export const ProductUpsertArgsSchema: z.ZodType<Prisma.ProductUpsertArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereUniqueInputSchema, 
  create: z.union([ ProductCreateInputSchema, ProductUncheckedCreateInputSchema ]),
  update: z.union([ ProductUpdateInputSchema, ProductUncheckedUpdateInputSchema ]),
}).strict();

export const ProductCreateManyArgsSchema: z.ZodType<Prisma.ProductCreateManyArgs> = z.object({
  data: z.union([ ProductCreateManyInputSchema, ProductCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const ProductCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductCreateManyAndReturnArgs> = z.object({
  data: z.union([ ProductCreateManyInputSchema, ProductCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const ProductDeleteArgsSchema: z.ZodType<Prisma.ProductDeleteArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereUniqueInputSchema, 
}).strict();

export const ProductUpdateArgsSchema: z.ZodType<Prisma.ProductUpdateArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  data: z.union([ ProductUpdateInputSchema, ProductUncheckedUpdateInputSchema ]),
  where: ProductWhereUniqueInputSchema, 
}).strict();

export const ProductUpdateManyArgsSchema: z.ZodType<Prisma.ProductUpdateManyArgs> = z.object({
  data: z.union([ ProductUpdateManyMutationInputSchema, ProductUncheckedUpdateManyInputSchema ]),
  where: ProductWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ProductUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ProductUpdateManyMutationInputSchema, ProductUncheckedUpdateManyInputSchema ]),
  where: ProductWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ProductDeleteManyArgsSchema: z.ZodType<Prisma.ProductDeleteManyArgs> = z.object({
  where: ProductWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VendorCustomersCreateArgsSchema: z.ZodType<Prisma.VendorCustomersCreateArgs> = z.object({
  select: VendorCustomersSelectSchema.optional(),
  include: VendorCustomersIncludeSchema.optional(),
  data: z.union([ VendorCustomersCreateInputSchema, VendorCustomersUncheckedCreateInputSchema ]),
}).strict();

export const VendorCustomersUpsertArgsSchema: z.ZodType<Prisma.VendorCustomersUpsertArgs> = z.object({
  select: VendorCustomersSelectSchema.optional(),
  include: VendorCustomersIncludeSchema.optional(),
  where: VendorCustomersWhereUniqueInputSchema, 
  create: z.union([ VendorCustomersCreateInputSchema, VendorCustomersUncheckedCreateInputSchema ]),
  update: z.union([ VendorCustomersUpdateInputSchema, VendorCustomersUncheckedUpdateInputSchema ]),
}).strict();

export const VendorCustomersCreateManyArgsSchema: z.ZodType<Prisma.VendorCustomersCreateManyArgs> = z.object({
  data: z.union([ VendorCustomersCreateManyInputSchema, VendorCustomersCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const VendorCustomersCreateManyAndReturnArgsSchema: z.ZodType<Prisma.VendorCustomersCreateManyAndReturnArgs> = z.object({
  data: z.union([ VendorCustomersCreateManyInputSchema, VendorCustomersCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const VendorCustomersDeleteArgsSchema: z.ZodType<Prisma.VendorCustomersDeleteArgs> = z.object({
  select: VendorCustomersSelectSchema.optional(),
  include: VendorCustomersIncludeSchema.optional(),
  where: VendorCustomersWhereUniqueInputSchema, 
}).strict();

export const VendorCustomersUpdateArgsSchema: z.ZodType<Prisma.VendorCustomersUpdateArgs> = z.object({
  select: VendorCustomersSelectSchema.optional(),
  include: VendorCustomersIncludeSchema.optional(),
  data: z.union([ VendorCustomersUpdateInputSchema, VendorCustomersUncheckedUpdateInputSchema ]),
  where: VendorCustomersWhereUniqueInputSchema, 
}).strict();

export const VendorCustomersUpdateManyArgsSchema: z.ZodType<Prisma.VendorCustomersUpdateManyArgs> = z.object({
  data: z.union([ VendorCustomersUpdateManyMutationInputSchema, VendorCustomersUncheckedUpdateManyInputSchema ]),
  where: VendorCustomersWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VendorCustomersUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.VendorCustomersUpdateManyAndReturnArgs> = z.object({
  data: z.union([ VendorCustomersUpdateManyMutationInputSchema, VendorCustomersUncheckedUpdateManyInputSchema ]),
  where: VendorCustomersWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VendorCustomersDeleteManyArgsSchema: z.ZodType<Prisma.VendorCustomersDeleteManyArgs> = z.object({
  where: VendorCustomersWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CustomerSubscriptionCreateArgsSchema: z.ZodType<Prisma.CustomerSubscriptionCreateArgs> = z.object({
  select: CustomerSubscriptionSelectSchema.optional(),
  include: CustomerSubscriptionIncludeSchema.optional(),
  data: z.union([ CustomerSubscriptionCreateInputSchema, CustomerSubscriptionUncheckedCreateInputSchema ]),
}).strict();

export const CustomerSubscriptionUpsertArgsSchema: z.ZodType<Prisma.CustomerSubscriptionUpsertArgs> = z.object({
  select: CustomerSubscriptionSelectSchema.optional(),
  include: CustomerSubscriptionIncludeSchema.optional(),
  where: CustomerSubscriptionWhereUniqueInputSchema, 
  create: z.union([ CustomerSubscriptionCreateInputSchema, CustomerSubscriptionUncheckedCreateInputSchema ]),
  update: z.union([ CustomerSubscriptionUpdateInputSchema, CustomerSubscriptionUncheckedUpdateInputSchema ]),
}).strict();

export const CustomerSubscriptionCreateManyArgsSchema: z.ZodType<Prisma.CustomerSubscriptionCreateManyArgs> = z.object({
  data: z.union([ CustomerSubscriptionCreateManyInputSchema, CustomerSubscriptionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CustomerSubscriptionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CustomerSubscriptionCreateManyAndReturnArgs> = z.object({
  data: z.union([ CustomerSubscriptionCreateManyInputSchema, CustomerSubscriptionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CustomerSubscriptionDeleteArgsSchema: z.ZodType<Prisma.CustomerSubscriptionDeleteArgs> = z.object({
  select: CustomerSubscriptionSelectSchema.optional(),
  include: CustomerSubscriptionIncludeSchema.optional(),
  where: CustomerSubscriptionWhereUniqueInputSchema, 
}).strict();

export const CustomerSubscriptionUpdateArgsSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateArgs> = z.object({
  select: CustomerSubscriptionSelectSchema.optional(),
  include: CustomerSubscriptionIncludeSchema.optional(),
  data: z.union([ CustomerSubscriptionUpdateInputSchema, CustomerSubscriptionUncheckedUpdateInputSchema ]),
  where: CustomerSubscriptionWhereUniqueInputSchema, 
}).strict();

export const CustomerSubscriptionUpdateManyArgsSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateManyArgs> = z.object({
  data: z.union([ CustomerSubscriptionUpdateManyMutationInputSchema, CustomerSubscriptionUncheckedUpdateManyInputSchema ]),
  where: CustomerSubscriptionWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CustomerSubscriptionUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CustomerSubscriptionUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CustomerSubscriptionUpdateManyMutationInputSchema, CustomerSubscriptionUncheckedUpdateManyInputSchema ]),
  where: CustomerSubscriptionWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CustomerSubscriptionDeleteManyArgsSchema: z.ZodType<Prisma.CustomerSubscriptionDeleteManyArgs> = z.object({
  where: CustomerSubscriptionWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const RequestsCreateArgsSchema: z.ZodType<Prisma.RequestsCreateArgs> = z.object({
  select: RequestsSelectSchema.optional(),
  include: RequestsIncludeSchema.optional(),
  data: z.union([ RequestsCreateInputSchema, RequestsUncheckedCreateInputSchema ]),
}).strict();

export const RequestsUpsertArgsSchema: z.ZodType<Prisma.RequestsUpsertArgs> = z.object({
  select: RequestsSelectSchema.optional(),
  include: RequestsIncludeSchema.optional(),
  where: RequestsWhereUniqueInputSchema, 
  create: z.union([ RequestsCreateInputSchema, RequestsUncheckedCreateInputSchema ]),
  update: z.union([ RequestsUpdateInputSchema, RequestsUncheckedUpdateInputSchema ]),
}).strict();

export const RequestsCreateManyArgsSchema: z.ZodType<Prisma.RequestsCreateManyArgs> = z.object({
  data: z.union([ RequestsCreateManyInputSchema, RequestsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const RequestsCreateManyAndReturnArgsSchema: z.ZodType<Prisma.RequestsCreateManyAndReturnArgs> = z.object({
  data: z.union([ RequestsCreateManyInputSchema, RequestsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const RequestsDeleteArgsSchema: z.ZodType<Prisma.RequestsDeleteArgs> = z.object({
  select: RequestsSelectSchema.optional(),
  include: RequestsIncludeSchema.optional(),
  where: RequestsWhereUniqueInputSchema, 
}).strict();

export const RequestsUpdateArgsSchema: z.ZodType<Prisma.RequestsUpdateArgs> = z.object({
  select: RequestsSelectSchema.optional(),
  include: RequestsIncludeSchema.optional(),
  data: z.union([ RequestsUpdateInputSchema, RequestsUncheckedUpdateInputSchema ]),
  where: RequestsWhereUniqueInputSchema, 
}).strict();

export const RequestsUpdateManyArgsSchema: z.ZodType<Prisma.RequestsUpdateManyArgs> = z.object({
  data: z.union([ RequestsUpdateManyMutationInputSchema, RequestsUncheckedUpdateManyInputSchema ]),
  where: RequestsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const RequestsUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.RequestsUpdateManyAndReturnArgs> = z.object({
  data: z.union([ RequestsUpdateManyMutationInputSchema, RequestsUncheckedUpdateManyInputSchema ]),
  where: RequestsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const RequestsDeleteManyArgsSchema: z.ZodType<Prisma.RequestsDeleteManyArgs> = z.object({
  where: RequestsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PushTokenCreateArgsSchema: z.ZodType<Prisma.PushTokenCreateArgs> = z.object({
  select: PushTokenSelectSchema.optional(),
  include: PushTokenIncludeSchema.optional(),
  data: z.union([ PushTokenCreateInputSchema, PushTokenUncheckedCreateInputSchema ]),
}).strict();

export const PushTokenUpsertArgsSchema: z.ZodType<Prisma.PushTokenUpsertArgs> = z.object({
  select: PushTokenSelectSchema.optional(),
  include: PushTokenIncludeSchema.optional(),
  where: PushTokenWhereUniqueInputSchema, 
  create: z.union([ PushTokenCreateInputSchema, PushTokenUncheckedCreateInputSchema ]),
  update: z.union([ PushTokenUpdateInputSchema, PushTokenUncheckedUpdateInputSchema ]),
}).strict();

export const PushTokenCreateManyArgsSchema: z.ZodType<Prisma.PushTokenCreateManyArgs> = z.object({
  data: z.union([ PushTokenCreateManyInputSchema, PushTokenCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const PushTokenCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PushTokenCreateManyAndReturnArgs> = z.object({
  data: z.union([ PushTokenCreateManyInputSchema, PushTokenCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const PushTokenDeleteArgsSchema: z.ZodType<Prisma.PushTokenDeleteArgs> = z.object({
  select: PushTokenSelectSchema.optional(),
  include: PushTokenIncludeSchema.optional(),
  where: PushTokenWhereUniqueInputSchema, 
}).strict();

export const PushTokenUpdateArgsSchema: z.ZodType<Prisma.PushTokenUpdateArgs> = z.object({
  select: PushTokenSelectSchema.optional(),
  include: PushTokenIncludeSchema.optional(),
  data: z.union([ PushTokenUpdateInputSchema, PushTokenUncheckedUpdateInputSchema ]),
  where: PushTokenWhereUniqueInputSchema, 
}).strict();

export const PushTokenUpdateManyArgsSchema: z.ZodType<Prisma.PushTokenUpdateManyArgs> = z.object({
  data: z.union([ PushTokenUpdateManyMutationInputSchema, PushTokenUncheckedUpdateManyInputSchema ]),
  where: PushTokenWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PushTokenUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.PushTokenUpdateManyAndReturnArgs> = z.object({
  data: z.union([ PushTokenUpdateManyMutationInputSchema, PushTokenUncheckedUpdateManyInputSchema ]),
  where: PushTokenWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PushTokenDeleteManyArgsSchema: z.ZodType<Prisma.PushTokenDeleteManyArgs> = z.object({
  where: PushTokenWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();