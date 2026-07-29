import { z } from 'zod';
import { Prisma } from '@prisma/client';
export const DecimalJsLikeSchema = z.object({
    d: z.array(z.number()),
    e: z.number(),
    s: z.number(),
    toFixed: z.any(),
});
export const DECIMAL_STRING_REGEX = /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/;
export const isValidDecimalInput = (v) => {
    if (v === undefined || v === null)
        return false;
    return ((typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
        (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
        typeof v === 'number');
};
export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted', 'ReadCommitted', 'RepeatableRead', 'Serializable']);
export const UserScalarFieldEnumSchema = z.enum(['id', 'name', 'phone', 'address', 'role', 'createdAt', 'updatedAt']);
export const VendorScalarFieldEnumSchema = z.enum(['id', 'userId', 'businessName', 'businessPhone', 'createdAt', 'updatedAt']);
export const ProductScalarFieldEnumSchema = z.enum(['id', 'vendorId', 'productName', 'description', 'unit', 'createdAt', 'updatedAt']);
export const VendorCustomersScalarFieldEnumSchema = z.enum(['id', 'vendorId', 'customerId', 'customerPhone', 'createdAt', 'updatedAt']);
export const CustomerSubscriptionScalarFieldEnumSchema = z.enum(['id', 'vendorCustomerId', 'productId', 'startDate', 'dailyQuantity', 'createdAt', 'updatedAt']);
export const RequestsScalarFieldEnumSchema = z.enum(['id', 'vendorCustomerId', 'productId', 'subscriptionId', 'type', 'message', 'start_date', 'end_date', 'requestedQuantity', 'status', 'respondedAt', 'createdAt', 'updatedAt']);
export const PushTokenScalarFieldEnumSchema = z.enum(['id', 'token', 'platform', 'userId', 'createdAt']);
export const SortOrderSchema = z.enum(['asc', 'desc']);
export const QueryModeSchema = z.enum(['default', 'insensitive']);
export const NullsOrderSchema = z.enum(['first', 'last']);
export const RoleSchema = z.enum(['CUSTOMER', 'VENDOR']);
export const StatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED']);
export const ProductUnitSchema = z.enum(['PIECE', 'PACKET', 'BOTTLE', 'LITRE', 'ML', 'KG', 'GRAM', 'DOZEN']);
export const RequestTypeSchema = z.enum(['NOTE', 'SKIP', 'INCREASE', 'DECREASE']);
export const PlatformSchema = z.enum(['ANDROID', 'IOS']);
export const UserSchema = z.object({
    role: RoleSchema,
    id: z.uuid(),
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    address: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const VendorSchema = z.object({
    id: z.uuid(),
    userId: z.string(),
    businessName: z.string().min(2, { message: "Business name must be at least 2 characters long" }),
    businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const ProductSchema = z.object({
    unit: ProductUnitSchema,
    id: z.uuid(),
    vendorId: z.string(),
    productName: z.string().min(2, { message: "Product name must be of at least 2 characters" }),
    description: z.string().min(2, { message: "Product description must be of at leat 2 characters" }),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const VendorCustomersSchema = z.object({
    id: z.uuid(),
    vendorId: z.string(),
    customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    customerPhone: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const CustomerSubscriptionSchema = z.object({
    id: z.uuid(),
    vendorCustomerId: z.string(),
    productId: z.string(),
    startDate: z.coerce.date(),
    dailyQuantity: z.instanceof(Prisma.Decimal, { message: "Field 'dailyQuantity' must be a Decimal. Location: ['Models', 'CustomerSubscription']" }),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const RequestsSchema = z.object({
    type: RequestTypeSchema,
    status: StatusSchema,
    id: z.uuid(),
    vendorCustomerId: z.string(),
    productId: z.string(),
    subscriptionId: z.string(),
    message: z.string().min(2, { message: "Message should be at least 2 of 2 characters" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    requestedQuantity: z.instanceof(Prisma.Decimal, { message: "Field 'requestedQuantity' must be a Decimal. Location: ['Models', 'Requests']" }).nullable(),
    respondedAt: z.coerce.date().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const PushTokenSchema = z.object({
    platform: PlatformSchema,
    id: z.cuid(),
    token: z.string(),
    userId: z.string(),
    createdAt: z.coerce.date(),
});
export const UserIncludeSchema = z.object({
    vendor: z.union([z.boolean(), z.lazy(() => VendorArgsSchema)]).optional(),
    vendorcustomers: z.union([z.boolean(), z.lazy(() => VendorCustomersFindManyArgsSchema)]).optional(),
    pushToken: z.union([z.boolean(), z.lazy(() => PushTokenFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict();
export const UserArgsSchema = z.object({
    select: z.lazy(() => UserSelectSchema).optional(),
    include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();
export const UserCountOutputTypeArgsSchema = z.object({
    select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();
export const UserCountOutputTypeSelectSchema = z.object({
    vendorcustomers: z.boolean().optional(),
    pushToken: z.boolean().optional(),
}).strict();
export const UserSelectSchema = z.object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    phone: z.boolean().optional(),
    address: z.boolean().optional(),
    role: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    vendor: z.union([z.boolean(), z.lazy(() => VendorArgsSchema)]).optional(),
    vendorcustomers: z.union([z.boolean(), z.lazy(() => VendorCustomersFindManyArgsSchema)]).optional(),
    pushToken: z.union([z.boolean(), z.lazy(() => PushTokenFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict();
export const VendorIncludeSchema = z.object({
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    product: z.union([z.boolean(), z.lazy(() => ProductFindManyArgsSchema)]).optional(),
    vendorcustomers: z.union([z.boolean(), z.lazy(() => VendorCustomersFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => VendorCountOutputTypeArgsSchema)]).optional(),
}).strict();
export const VendorArgsSchema = z.object({
    select: z.lazy(() => VendorSelectSchema).optional(),
    include: z.lazy(() => VendorIncludeSchema).optional(),
}).strict();
export const VendorCountOutputTypeArgsSchema = z.object({
    select: z.lazy(() => VendorCountOutputTypeSelectSchema).nullish(),
}).strict();
export const VendorCountOutputTypeSelectSchema = z.object({
    product: z.boolean().optional(),
    vendorcustomers: z.boolean().optional(),
}).strict();
export const VendorSelectSchema = z.object({
    id: z.boolean().optional(),
    userId: z.boolean().optional(),
    businessName: z.boolean().optional(),
    businessPhone: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    product: z.union([z.boolean(), z.lazy(() => ProductFindManyArgsSchema)]).optional(),
    vendorcustomers: z.union([z.boolean(), z.lazy(() => VendorCustomersFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => VendorCountOutputTypeArgsSchema)]).optional(),
}).strict();
export const ProductIncludeSchema = z.object({
    vendor: z.union([z.boolean(), z.lazy(() => VendorArgsSchema)]).optional(),
    subscription: z.union([z.boolean(), z.lazy(() => CustomerSubscriptionFindManyArgsSchema)]).optional(),
    request: z.union([z.boolean(), z.lazy(() => RequestsFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => ProductCountOutputTypeArgsSchema)]).optional(),
}).strict();
export const ProductArgsSchema = z.object({
    select: z.lazy(() => ProductSelectSchema).optional(),
    include: z.lazy(() => ProductIncludeSchema).optional(),
}).strict();
export const ProductCountOutputTypeArgsSchema = z.object({
    select: z.lazy(() => ProductCountOutputTypeSelectSchema).nullish(),
}).strict();
export const ProductCountOutputTypeSelectSchema = z.object({
    subscription: z.boolean().optional(),
    request: z.boolean().optional(),
}).strict();
export const ProductSelectSchema = z.object({
    id: z.boolean().optional(),
    vendorId: z.boolean().optional(),
    productName: z.boolean().optional(),
    description: z.boolean().optional(),
    unit: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    vendor: z.union([z.boolean(), z.lazy(() => VendorArgsSchema)]).optional(),
    subscription: z.union([z.boolean(), z.lazy(() => CustomerSubscriptionFindManyArgsSchema)]).optional(),
    request: z.union([z.boolean(), z.lazy(() => RequestsFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => ProductCountOutputTypeArgsSchema)]).optional(),
}).strict();
export const VendorCustomersIncludeSchema = z.object({
    vendor: z.union([z.boolean(), z.lazy(() => VendorArgsSchema)]).optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    subscription: z.union([z.boolean(), z.lazy(() => CustomerSubscriptionFindManyArgsSchema)]).optional(),
    request: z.union([z.boolean(), z.lazy(() => RequestsFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => VendorCustomersCountOutputTypeArgsSchema)]).optional(),
}).strict();
export const VendorCustomersArgsSchema = z.object({
    select: z.lazy(() => VendorCustomersSelectSchema).optional(),
    include: z.lazy(() => VendorCustomersIncludeSchema).optional(),
}).strict();
export const VendorCustomersCountOutputTypeArgsSchema = z.object({
    select: z.lazy(() => VendorCustomersCountOutputTypeSelectSchema).nullish(),
}).strict();
export const VendorCustomersCountOutputTypeSelectSchema = z.object({
    subscription: z.boolean().optional(),
    request: z.boolean().optional(),
}).strict();
export const VendorCustomersSelectSchema = z.object({
    id: z.boolean().optional(),
    vendorId: z.boolean().optional(),
    customerId: z.boolean().optional(),
    customerPhone: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    vendor: z.union([z.boolean(), z.lazy(() => VendorArgsSchema)]).optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    subscription: z.union([z.boolean(), z.lazy(() => CustomerSubscriptionFindManyArgsSchema)]).optional(),
    request: z.union([z.boolean(), z.lazy(() => RequestsFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => VendorCustomersCountOutputTypeArgsSchema)]).optional(),
}).strict();
export const CustomerSubscriptionIncludeSchema = z.object({
    vendorCustomers: z.union([z.boolean(), z.lazy(() => VendorCustomersArgsSchema)]).optional(),
    product: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    requests: z.union([z.boolean(), z.lazy(() => RequestsFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => CustomerSubscriptionCountOutputTypeArgsSchema)]).optional(),
}).strict();
export const CustomerSubscriptionArgsSchema = z.object({
    select: z.lazy(() => CustomerSubscriptionSelectSchema).optional(),
    include: z.lazy(() => CustomerSubscriptionIncludeSchema).optional(),
}).strict();
export const CustomerSubscriptionCountOutputTypeArgsSchema = z.object({
    select: z.lazy(() => CustomerSubscriptionCountOutputTypeSelectSchema).nullish(),
}).strict();
export const CustomerSubscriptionCountOutputTypeSelectSchema = z.object({
    requests: z.boolean().optional(),
}).strict();
export const CustomerSubscriptionSelectSchema = z.object({
    id: z.boolean().optional(),
    vendorCustomerId: z.boolean().optional(),
    productId: z.boolean().optional(),
    startDate: z.boolean().optional(),
    dailyQuantity: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    vendorCustomers: z.union([z.boolean(), z.lazy(() => VendorCustomersArgsSchema)]).optional(),
    product: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    requests: z.union([z.boolean(), z.lazy(() => RequestsFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => CustomerSubscriptionCountOutputTypeArgsSchema)]).optional(),
}).strict();
export const RequestsIncludeSchema = z.object({
    vendorCustomers: z.union([z.boolean(), z.lazy(() => VendorCustomersArgsSchema)]).optional(),
    product: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    subscription: z.union([z.boolean(), z.lazy(() => CustomerSubscriptionArgsSchema)]).optional(),
}).strict();
export const RequestsArgsSchema = z.object({
    select: z.lazy(() => RequestsSelectSchema).optional(),
    include: z.lazy(() => RequestsIncludeSchema).optional(),
}).strict();
export const RequestsSelectSchema = z.object({
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
    vendorCustomers: z.union([z.boolean(), z.lazy(() => VendorCustomersArgsSchema)]).optional(),
    product: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    subscription: z.union([z.boolean(), z.lazy(() => CustomerSubscriptionArgsSchema)]).optional(),
}).strict();
export const PushTokenIncludeSchema = z.object({
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
}).strict();
export const PushTokenArgsSchema = z.object({
    select: z.lazy(() => PushTokenSelectSchema).optional(),
    include: z.lazy(() => PushTokenIncludeSchema).optional(),
}).strict();
export const PushTokenSelectSchema = z.object({
    id: z.boolean().optional(),
    token: z.boolean().optional(),
    platform: z.boolean().optional(),
    userId: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
}).strict();
export const UserWhereInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => UserWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    phone: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    address: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    role: z.union([z.lazy(() => EnumRoleFilterSchema), z.lazy(() => RoleSchema)]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    vendor: z.union([z.lazy(() => VendorNullableScalarRelationFilterSchema), z.lazy(() => VendorWhereInputSchema)]).optional().nullable(),
    vendorcustomers: z.lazy(() => VendorCustomersListRelationFilterSchema).optional(),
    pushToken: z.lazy(() => PushTokenListRelationFilterSchema).optional(),
});
export const UserOrderByWithRelationInputSchema = z.strictObject({
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
export const UserWhereUniqueInputSchema = z.union([
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
    AND: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => UserWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
    name: z.union([z.lazy(() => StringFilterSchema), z.string().min(2, { message: "Name must be at least 2 characters long" })]).optional(),
    address: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    role: z.union([z.lazy(() => EnumRoleFilterSchema), z.lazy(() => RoleSchema)]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    vendor: z.union([z.lazy(() => VendorNullableScalarRelationFilterSchema), z.lazy(() => VendorWhereInputSchema)]).optional().nullable(),
    vendorcustomers: z.lazy(() => VendorCustomersListRelationFilterSchema).optional(),
    pushToken: z.lazy(() => PushTokenListRelationFilterSchema).optional(),
}));
export const UserOrderByWithAggregationInputSchema = z.strictObject({
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
export const UserScalarWhereWithAggregatesInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array()]).optional(),
    OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    phone: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    address: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    role: z.union([z.lazy(() => EnumRoleWithAggregatesFilterSchema), z.lazy(() => RoleSchema)]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
});
export const VendorWhereInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => VendorWhereInputSchema), z.lazy(() => VendorWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => VendorWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => VendorWhereInputSchema), z.lazy(() => VendorWhereInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    businessName: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    businessPhone: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    user: z.union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)]).optional(),
    product: z.lazy(() => ProductListRelationFilterSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersListRelationFilterSchema).optional(),
});
export const VendorOrderByWithRelationInputSchema = z.strictObject({
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
export const VendorWhereUniqueInputSchema = z.union([
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
    AND: z.union([z.lazy(() => VendorWhereInputSchema), z.lazy(() => VendorWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => VendorWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => VendorWhereInputSchema), z.lazy(() => VendorWhereInputSchema).array()]).optional(),
    businessName: z.union([z.lazy(() => StringFilterSchema), z.string().min(2, { message: "Business name must be at least 2 characters long" })]).optional(),
    businessPhone: z.union([z.lazy(() => StringFilterSchema), z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" })]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    user: z.union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)]).optional(),
    product: z.lazy(() => ProductListRelationFilterSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersListRelationFilterSchema).optional(),
}));
export const VendorOrderByWithAggregationInputSchema = z.strictObject({
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
export const VendorScalarWhereWithAggregatesInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => VendorScalarWhereWithAggregatesInputSchema), z.lazy(() => VendorScalarWhereWithAggregatesInputSchema).array()]).optional(),
    OR: z.lazy(() => VendorScalarWhereWithAggregatesInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => VendorScalarWhereWithAggregatesInputSchema), z.lazy(() => VendorScalarWhereWithAggregatesInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    userId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    businessName: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    businessPhone: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
});
export const ProductWhereInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => ProductWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    vendorId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productName: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    description: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    unit: z.union([z.lazy(() => EnumProductUnitFilterSchema), z.lazy(() => ProductUnitSchema)]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    vendor: z.union([z.lazy(() => VendorScalarRelationFilterSchema), z.lazy(() => VendorWhereInputSchema)]).optional(),
    subscription: z.lazy(() => CustomerSubscriptionListRelationFilterSchema).optional(),
    request: z.lazy(() => RequestsListRelationFilterSchema).optional(),
});
export const ProductOrderByWithRelationInputSchema = z.strictObject({
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
export const ProductWhereUniqueInputSchema = z.object({
    id: z.uuid(),
})
    .and(z.strictObject({
    id: z.uuid().optional(),
    AND: z.union([z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => ProductWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array()]).optional(),
    vendorId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productName: z.union([z.lazy(() => StringFilterSchema), z.string().min(2, { message: "Product name must be of at least 2 characters" })]).optional(),
    description: z.union([z.lazy(() => StringFilterSchema), z.string().min(2, { message: "Product description must be of at leat 2 characters" })]).optional(),
    unit: z.union([z.lazy(() => EnumProductUnitFilterSchema), z.lazy(() => ProductUnitSchema)]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    vendor: z.union([z.lazy(() => VendorScalarRelationFilterSchema), z.lazy(() => VendorWhereInputSchema)]).optional(),
    subscription: z.lazy(() => CustomerSubscriptionListRelationFilterSchema).optional(),
    request: z.lazy(() => RequestsListRelationFilterSchema).optional(),
}));
export const ProductOrderByWithAggregationInputSchema = z.strictObject({
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
export const ProductScalarWhereWithAggregatesInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => ProductScalarWhereWithAggregatesInputSchema), z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array()]).optional(),
    OR: z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => ProductScalarWhereWithAggregatesInputSchema), z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    vendorId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    productName: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    description: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    unit: z.union([z.lazy(() => EnumProductUnitWithAggregatesFilterSchema), z.lazy(() => ProductUnitSchema)]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
});
export const VendorCustomersWhereInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => VendorCustomersWhereInputSchema), z.lazy(() => VendorCustomersWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => VendorCustomersWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => VendorCustomersWhereInputSchema), z.lazy(() => VendorCustomersWhereInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    vendorId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    customerId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    customerPhone: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    vendor: z.union([z.lazy(() => VendorScalarRelationFilterSchema), z.lazy(() => VendorWhereInputSchema)]).optional(),
    user: z.union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)]).optional(),
    subscription: z.lazy(() => CustomerSubscriptionListRelationFilterSchema).optional(),
    request: z.lazy(() => RequestsListRelationFilterSchema).optional(),
});
export const VendorCustomersOrderByWithRelationInputSchema = z.strictObject({
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
export const VendorCustomersWhereUniqueInputSchema = z.union([
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
    AND: z.union([z.lazy(() => VendorCustomersWhereInputSchema), z.lazy(() => VendorCustomersWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => VendorCustomersWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => VendorCustomersWhereInputSchema), z.lazy(() => VendorCustomersWhereInputSchema).array()]).optional(),
    vendorId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    customerId: z.union([z.lazy(() => StringFilterSchema), z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" })]).optional(),
    customerPhone: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    vendor: z.union([z.lazy(() => VendorScalarRelationFilterSchema), z.lazy(() => VendorWhereInputSchema)]).optional(),
    user: z.union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)]).optional(),
    subscription: z.lazy(() => CustomerSubscriptionListRelationFilterSchema).optional(),
    request: z.lazy(() => RequestsListRelationFilterSchema).optional(),
}));
export const VendorCustomersOrderByWithAggregationInputSchema = z.strictObject({
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
export const VendorCustomersScalarWhereWithAggregatesInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => VendorCustomersScalarWhereWithAggregatesInputSchema), z.lazy(() => VendorCustomersScalarWhereWithAggregatesInputSchema).array()]).optional(),
    OR: z.lazy(() => VendorCustomersScalarWhereWithAggregatesInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => VendorCustomersScalarWhereWithAggregatesInputSchema), z.lazy(() => VendorCustomersScalarWhereWithAggregatesInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    vendorId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    customerId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    customerPhone: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
});
export const CustomerSubscriptionWhereInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => CustomerSubscriptionWhereInputSchema), z.lazy(() => CustomerSubscriptionWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => CustomerSubscriptionWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => CustomerSubscriptionWhereInputSchema), z.lazy(() => CustomerSubscriptionWhereInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    vendorCustomerId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    startDate: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    dailyQuantity: z.union([z.lazy(() => DecimalFilterSchema), z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    vendorCustomers: z.union([z.lazy(() => VendorCustomersScalarRelationFilterSchema), z.lazy(() => VendorCustomersWhereInputSchema)]).optional(),
    product: z.union([z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema)]).optional(),
    requests: z.lazy(() => RequestsListRelationFilterSchema).optional(),
});
export const CustomerSubscriptionOrderByWithRelationInputSchema = z.strictObject({
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
export const CustomerSubscriptionWhereUniqueInputSchema = z.union([
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
    AND: z.union([z.lazy(() => CustomerSubscriptionWhereInputSchema), z.lazy(() => CustomerSubscriptionWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => CustomerSubscriptionWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => CustomerSubscriptionWhereInputSchema), z.lazy(() => CustomerSubscriptionWhereInputSchema).array()]).optional(),
    vendorCustomerId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    startDate: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    dailyQuantity: z.union([z.lazy(() => DecimalFilterSchema), z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    vendorCustomers: z.union([z.lazy(() => VendorCustomersScalarRelationFilterSchema), z.lazy(() => VendorCustomersWhereInputSchema)]).optional(),
    product: z.union([z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema)]).optional(),
    requests: z.lazy(() => RequestsListRelationFilterSchema).optional(),
}));
export const CustomerSubscriptionOrderByWithAggregationInputSchema = z.strictObject({
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
export const CustomerSubscriptionScalarWhereWithAggregatesInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => CustomerSubscriptionScalarWhereWithAggregatesInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereWithAggregatesInputSchema).array()]).optional(),
    OR: z.lazy(() => CustomerSubscriptionScalarWhereWithAggregatesInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => CustomerSubscriptionScalarWhereWithAggregatesInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereWithAggregatesInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    vendorCustomerId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    productId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    startDate: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
    dailyQuantity: z.union([z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
});
export const RequestsWhereInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => RequestsWhereInputSchema), z.lazy(() => RequestsWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => RequestsWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => RequestsWhereInputSchema), z.lazy(() => RequestsWhereInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    vendorCustomerId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    subscriptionId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    type: z.union([z.lazy(() => EnumRequestTypeFilterSchema), z.lazy(() => RequestTypeSchema)]).optional(),
    message: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    start_date: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    end_date: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    requestedQuantity: z.union([z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })]).optional().nullable(),
    status: z.union([z.lazy(() => EnumStatusFilterSchema), z.lazy(() => StatusSchema)]).optional(),
    respondedAt: z.union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()]).optional().nullable(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    vendorCustomers: z.union([z.lazy(() => VendorCustomersScalarRelationFilterSchema), z.lazy(() => VendorCustomersWhereInputSchema)]).optional(),
    product: z.union([z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema)]).optional(),
    subscription: z.union([z.lazy(() => CustomerSubscriptionScalarRelationFilterSchema), z.lazy(() => CustomerSubscriptionWhereInputSchema)]).optional(),
});
export const RequestsOrderByWithRelationInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
    productId: z.lazy(() => SortOrderSchema).optional(),
    subscriptionId: z.lazy(() => SortOrderSchema).optional(),
    type: z.lazy(() => SortOrderSchema).optional(),
    message: z.lazy(() => SortOrderSchema).optional(),
    start_date: z.lazy(() => SortOrderSchema).optional(),
    end_date: z.lazy(() => SortOrderSchema).optional(),
    requestedQuantity: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    respondedAt: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    vendorCustomers: z.lazy(() => VendorCustomersOrderByWithRelationInputSchema).optional(),
    product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
    subscription: z.lazy(() => CustomerSubscriptionOrderByWithRelationInputSchema).optional(),
});
export const RequestsWhereUniqueInputSchema = z.object({
    id: z.uuid(),
})
    .and(z.strictObject({
    id: z.uuid().optional(),
    AND: z.union([z.lazy(() => RequestsWhereInputSchema), z.lazy(() => RequestsWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => RequestsWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => RequestsWhereInputSchema), z.lazy(() => RequestsWhereInputSchema).array()]).optional(),
    vendorCustomerId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    subscriptionId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    type: z.union([z.lazy(() => EnumRequestTypeFilterSchema), z.lazy(() => RequestTypeSchema)]).optional(),
    message: z.union([z.lazy(() => StringFilterSchema), z.string().min(2, { message: "Message should be at least 2 of 2 characters" })]).optional(),
    start_date: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    end_date: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    requestedQuantity: z.union([z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })]).optional().nullable(),
    status: z.union([z.lazy(() => EnumStatusFilterSchema), z.lazy(() => StatusSchema)]).optional(),
    respondedAt: z.union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()]).optional().nullable(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    vendorCustomers: z.union([z.lazy(() => VendorCustomersScalarRelationFilterSchema), z.lazy(() => VendorCustomersWhereInputSchema)]).optional(),
    product: z.union([z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema)]).optional(),
    subscription: z.union([z.lazy(() => CustomerSubscriptionScalarRelationFilterSchema), z.lazy(() => CustomerSubscriptionWhereInputSchema)]).optional(),
}));
export const RequestsOrderByWithAggregationInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
    productId: z.lazy(() => SortOrderSchema).optional(),
    subscriptionId: z.lazy(() => SortOrderSchema).optional(),
    type: z.lazy(() => SortOrderSchema).optional(),
    message: z.lazy(() => SortOrderSchema).optional(),
    start_date: z.lazy(() => SortOrderSchema).optional(),
    end_date: z.lazy(() => SortOrderSchema).optional(),
    requestedQuantity: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    respondedAt: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    _count: z.lazy(() => RequestsCountOrderByAggregateInputSchema).optional(),
    _avg: z.lazy(() => RequestsAvgOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => RequestsMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => RequestsMinOrderByAggregateInputSchema).optional(),
    _sum: z.lazy(() => RequestsSumOrderByAggregateInputSchema).optional(),
});
export const RequestsScalarWhereWithAggregatesInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => RequestsScalarWhereWithAggregatesInputSchema), z.lazy(() => RequestsScalarWhereWithAggregatesInputSchema).array()]).optional(),
    OR: z.lazy(() => RequestsScalarWhereWithAggregatesInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => RequestsScalarWhereWithAggregatesInputSchema), z.lazy(() => RequestsScalarWhereWithAggregatesInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    vendorCustomerId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    productId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    subscriptionId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    type: z.union([z.lazy(() => EnumRequestTypeWithAggregatesFilterSchema), z.lazy(() => RequestTypeSchema)]).optional(),
    message: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    start_date: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
    end_date: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
    requestedQuantity: z.union([z.lazy(() => DecimalNullableWithAggregatesFilterSchema), z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })]).optional().nullable(),
    status: z.union([z.lazy(() => EnumStatusWithAggregatesFilterSchema), z.lazy(() => StatusSchema)]).optional(),
    respondedAt: z.union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()]).optional().nullable(),
    createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
});
export const PushTokenWhereInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => PushTokenWhereInputSchema), z.lazy(() => PushTokenWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => PushTokenWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => PushTokenWhereInputSchema), z.lazy(() => PushTokenWhereInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    token: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    platform: z.union([z.lazy(() => EnumPlatformFilterSchema), z.lazy(() => PlatformSchema)]).optional(),
    userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    user: z.union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)]).optional(),
});
export const PushTokenOrderByWithRelationInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    token: z.lazy(() => SortOrderSchema).optional(),
    platform: z.lazy(() => SortOrderSchema).optional(),
    userId: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});
export const PushTokenWhereUniqueInputSchema = z.union([
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
    AND: z.union([z.lazy(() => PushTokenWhereInputSchema), z.lazy(() => PushTokenWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => PushTokenWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => PushTokenWhereInputSchema), z.lazy(() => PushTokenWhereInputSchema).array()]).optional(),
    platform: z.union([z.lazy(() => EnumPlatformFilterSchema), z.lazy(() => PlatformSchema)]).optional(),
    userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    user: z.union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)]).optional(),
}));
export const PushTokenOrderByWithAggregationInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    token: z.lazy(() => SortOrderSchema).optional(),
    platform: z.lazy(() => SortOrderSchema).optional(),
    userId: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    _count: z.lazy(() => PushTokenCountOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => PushTokenMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => PushTokenMinOrderByAggregateInputSchema).optional(),
});
export const PushTokenScalarWhereWithAggregatesInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => PushTokenScalarWhereWithAggregatesInputSchema), z.lazy(() => PushTokenScalarWhereWithAggregatesInputSchema).array()]).optional(),
    OR: z.lazy(() => PushTokenScalarWhereWithAggregatesInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => PushTokenScalarWhereWithAggregatesInputSchema), z.lazy(() => PushTokenScalarWhereWithAggregatesInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    token: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    platform: z.union([z.lazy(() => EnumPlatformWithAggregatesFilterSchema), z.lazy(() => PlatformSchema)]).optional(),
    userId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
});
export const UserCreateInputSchema = z.strictObject({
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
export const UserUncheckedCreateInputSchema = z.strictObject({
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
export const UserUpdateInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string().min(2, { message: "Name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    phone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    address: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    role: z.union([z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendor: z.lazy(() => VendorUpdateOneWithoutUserNestedInputSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUpdateManyWithoutUserNestedInputSchema).optional(),
    pushToken: z.lazy(() => PushTokenUpdateManyWithoutUserNestedInputSchema).optional(),
});
export const UserUncheckedUpdateInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string().min(2, { message: "Name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    phone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    address: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    role: z.union([z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendor: z.lazy(() => VendorUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
    pushToken: z.lazy(() => PushTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});
export const UserCreateManyInputSchema = z.strictObject({
    id: z.uuid().optional(),
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    address: z.string(),
    role: z.lazy(() => RoleSchema).optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const UserUpdateManyMutationInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string().min(2, { message: "Name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    phone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    address: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    role: z.union([z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const UserUncheckedUpdateManyInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string().min(2, { message: "Name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    phone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    address: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    role: z.union([z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const VendorCreateInputSchema = z.strictObject({
    id: z.uuid().optional(),
    businessName: z.string().min(2, { message: "Business name must be at least 2 characters long" }),
    businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    user: z.lazy(() => UserCreateNestedOneWithoutVendorInputSchema),
    product: z.lazy(() => ProductCreateNestedManyWithoutVendorInputSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersCreateNestedManyWithoutVendorInputSchema).optional(),
});
export const VendorUncheckedCreateInputSchema = z.strictObject({
    id: z.uuid().optional(),
    userId: z.string(),
    businessName: z.string().min(2, { message: "Business name must be at least 2 characters long" }),
    businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    product: z.lazy(() => ProductUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
});
export const VendorUpdateInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessName: z.union([z.string().min(2, { message: "Business name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessPhone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutVendorNestedInputSchema).optional(),
    product: z.lazy(() => ProductUpdateManyWithoutVendorNestedInputSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUpdateManyWithoutVendorNestedInputSchema).optional(),
});
export const VendorUncheckedUpdateInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessName: z.union([z.string().min(2, { message: "Business name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessPhone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    product: z.lazy(() => ProductUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
});
export const VendorCreateManyInputSchema = z.strictObject({
    id: z.uuid().optional(),
    userId: z.string(),
    businessName: z.string().min(2, { message: "Business name must be at least 2 characters long" }),
    businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const VendorUpdateManyMutationInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessName: z.union([z.string().min(2, { message: "Business name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessPhone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const VendorUncheckedUpdateManyInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessName: z.union([z.string().min(2, { message: "Business name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessPhone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const ProductCreateInputSchema = z.strictObject({
    id: z.uuid().optional(),
    productName: z.string().min(2, { message: "Product name must be of at least 2 characters" }),
    description: z.string().min(2, { message: "Product description must be of at leat 2 characters" }),
    unit: z.lazy(() => ProductUnitSchema),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendor: z.lazy(() => VendorCreateNestedOneWithoutProductInputSchema),
    subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutProductInputSchema).optional(),
    request: z.lazy(() => RequestsCreateNestedManyWithoutProductInputSchema).optional(),
});
export const ProductUncheckedCreateInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorId: z.string(),
    productName: z.string().min(2, { message: "Product name must be of at least 2 characters" }),
    description: z.string().min(2, { message: "Product description must be of at leat 2 characters" }),
    unit: z.lazy(() => ProductUnitSchema),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
    request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});
export const ProductUpdateInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productName: z.union([z.string().min(2, { message: "Product name must be of at least 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z.union([z.string().min(2, { message: "Product description must be of at leat 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    unit: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendor: z.lazy(() => VendorUpdateOneRequiredWithoutProductNestedInputSchema).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutProductNestedInputSchema).optional(),
    request: z.lazy(() => RequestsUpdateManyWithoutProductNestedInputSchema).optional(),
});
export const ProductUncheckedUpdateInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productName: z.union([z.string().min(2, { message: "Product name must be of at least 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z.union([z.string().min(2, { message: "Product description must be of at leat 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    unit: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
    request: z.lazy(() => RequestsUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});
export const ProductCreateManyInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorId: z.string(),
    productName: z.string().min(2, { message: "Product name must be of at least 2 characters" }),
    description: z.string().min(2, { message: "Product description must be of at leat 2 characters" }),
    unit: z.lazy(() => ProductUnitSchema),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const ProductUpdateManyMutationInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productName: z.union([z.string().min(2, { message: "Product name must be of at least 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z.union([z.string().min(2, { message: "Product description must be of at leat 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    unit: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const ProductUncheckedUpdateManyInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productName: z.union([z.string().min(2, { message: "Product name must be of at least 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z.union([z.string().min(2, { message: "Product description must be of at leat 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    unit: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const VendorCustomersCreateInputSchema = z.strictObject({
    id: z.uuid().optional(),
    customerPhone: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendor: z.lazy(() => VendorCreateNestedOneWithoutVendorcustomersInputSchema),
    user: z.lazy(() => UserCreateNestedOneWithoutVendorcustomersInputSchema),
    subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
    request: z.lazy(() => RequestsCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});
export const VendorCustomersUncheckedCreateInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorId: z.string(),
    customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    customerPhone: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
    request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});
export const VendorCustomersUpdateInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendor: z.lazy(() => VendorUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
    request: z.lazy(() => RequestsUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});
export const VendorCustomersUncheckedUpdateInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerId: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
    request: z.lazy(() => RequestsUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});
export const VendorCustomersCreateManyInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorId: z.string(),
    customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    customerPhone: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const VendorCustomersUpdateManyMutationInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const VendorCustomersUncheckedUpdateManyInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerId: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const CustomerSubscriptionCreateInputSchema = z.strictObject({
    id: z.uuid().optional(),
    startDate: z.coerce.date(),
    dailyQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendorCustomers: z.lazy(() => VendorCustomersCreateNestedOneWithoutSubscriptionInputSchema),
    product: z.lazy(() => ProductCreateNestedOneWithoutSubscriptionInputSchema),
    requests: z.lazy(() => RequestsCreateNestedManyWithoutSubscriptionInputSchema).optional(),
});
export const CustomerSubscriptionUncheckedCreateInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorCustomerId: z.string(),
    productId: z.string(),
    startDate: z.coerce.date(),
    dailyQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    requests: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutSubscriptionInputSchema).optional(),
});
export const CustomerSubscriptionUpdateInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    startDate: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    dailyQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => DecimalFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomers: z.lazy(() => VendorCustomersUpdateOneRequiredWithoutSubscriptionNestedInputSchema).optional(),
    product: z.lazy(() => ProductUpdateOneRequiredWithoutSubscriptionNestedInputSchema).optional(),
    requests: z.lazy(() => RequestsUpdateManyWithoutSubscriptionNestedInputSchema).optional(),
});
export const CustomerSubscriptionUncheckedUpdateInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomerId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    startDate: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    dailyQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => DecimalFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requests: z.lazy(() => RequestsUncheckedUpdateManyWithoutSubscriptionNestedInputSchema).optional(),
});
export const CustomerSubscriptionCreateManyInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorCustomerId: z.string(),
    productId: z.string(),
    startDate: z.coerce.date(),
    dailyQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const CustomerSubscriptionUpdateManyMutationInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    startDate: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    dailyQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => DecimalFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const CustomerSubscriptionUncheckedUpdateManyInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomerId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    startDate: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    dailyQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => DecimalFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const RequestsCreateInputSchema = z.strictObject({
    id: z.uuid().optional(),
    type: z.lazy(() => RequestTypeSchema).optional(),
    message: z.string().min(2, { message: "Message should be at least 2 of 2 characters" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    requestedQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    status: z.lazy(() => StatusSchema).optional(),
    respondedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendorCustomers: z.lazy(() => VendorCustomersCreateNestedOneWithoutRequestInputSchema),
    product: z.lazy(() => ProductCreateNestedOneWithoutRequestInputSchema),
    subscription: z.lazy(() => CustomerSubscriptionCreateNestedOneWithoutRequestsInputSchema),
});
export const RequestsUncheckedCreateInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorCustomerId: z.string(),
    productId: z.string(),
    subscriptionId: z.string(),
    type: z.lazy(() => RequestTypeSchema).optional(),
    message: z.string().min(2, { message: "Message should be at least 2 of 2 characters" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    requestedQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    status: z.lazy(() => StatusSchema).optional(),
    respondedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const RequestsUpdateInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema)]).optional(),
    message: z.union([z.string().min(2, { message: "Message should be at least 2 of 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    start_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    end_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requestedQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema)]).optional().nullable(),
    status: z.union([z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema)]).optional(),
    respondedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)]).optional().nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomers: z.lazy(() => VendorCustomersUpdateOneRequiredWithoutRequestNestedInputSchema).optional(),
    product: z.lazy(() => ProductUpdateOneRequiredWithoutRequestNestedInputSchema).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUpdateOneRequiredWithoutRequestsNestedInputSchema).optional(),
});
export const RequestsUncheckedUpdateInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomerId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    subscriptionId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema)]).optional(),
    message: z.union([z.string().min(2, { message: "Message should be at least 2 of 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    start_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    end_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requestedQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema)]).optional().nullable(),
    status: z.union([z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema)]).optional(),
    respondedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)]).optional().nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const RequestsCreateManyInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorCustomerId: z.string(),
    productId: z.string(),
    subscriptionId: z.string(),
    type: z.lazy(() => RequestTypeSchema).optional(),
    message: z.string().min(2, { message: "Message should be at least 2 of 2 characters" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    requestedQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    status: z.lazy(() => StatusSchema).optional(),
    respondedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const RequestsUpdateManyMutationInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema)]).optional(),
    message: z.union([z.string().min(2, { message: "Message should be at least 2 of 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    start_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    end_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requestedQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema)]).optional().nullable(),
    status: z.union([z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema)]).optional(),
    respondedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)]).optional().nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const RequestsUncheckedUpdateManyInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomerId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    subscriptionId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema)]).optional(),
    message: z.union([z.string().min(2, { message: "Message should be at least 2 of 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    start_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    end_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requestedQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema)]).optional().nullable(),
    status: z.union([z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema)]).optional(),
    respondedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)]).optional().nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const PushTokenCreateInputSchema = z.strictObject({
    id: z.cuid().optional(),
    token: z.string(),
    platform: z.lazy(() => PlatformSchema),
    createdAt: z.coerce.date().optional(),
    user: z.lazy(() => UserCreateNestedOneWithoutPushTokenInputSchema),
});
export const PushTokenUncheckedCreateInputSchema = z.strictObject({
    id: z.cuid().optional(),
    token: z.string(),
    platform: z.lazy(() => PlatformSchema),
    userId: z.string(),
    createdAt: z.coerce.date().optional(),
});
export const PushTokenUpdateInputSchema = z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    token: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    platform: z.union([z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutPushTokenNestedInputSchema).optional(),
});
export const PushTokenUncheckedUpdateInputSchema = z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    token: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    platform: z.union([z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema)]).optional(),
    userId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const PushTokenCreateManyInputSchema = z.strictObject({
    id: z.cuid().optional(),
    token: z.string(),
    platform: z.lazy(() => PlatformSchema),
    userId: z.string(),
    createdAt: z.coerce.date().optional(),
});
export const PushTokenUpdateManyMutationInputSchema = z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    token: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    platform: z.union([z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const PushTokenUncheckedUpdateManyInputSchema = z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    token: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    platform: z.union([z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema)]).optional(),
    userId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const StringFilterSchema = z.strictObject({
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
    not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
});
export const EnumRoleFilterSchema = z.strictObject({
    equals: z.lazy(() => RoleSchema).optional(),
    in: z.lazy(() => RoleSchema).array().optional(),
    notIn: z.lazy(() => RoleSchema).array().optional(),
    not: z.union([z.lazy(() => RoleSchema), z.lazy(() => NestedEnumRoleFilterSchema)]).optional(),
});
export const DateTimeFilterSchema = z.strictObject({
    equals: z.coerce.date().optional(),
    in: z.coerce.date().array().optional(),
    notIn: z.coerce.date().array().optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)]).optional(),
});
export const VendorNullableScalarRelationFilterSchema = z.strictObject({
    is: z.lazy(() => VendorWhereInputSchema).optional().nullable(),
    isNot: z.lazy(() => VendorWhereInputSchema).optional().nullable(),
});
export const VendorCustomersListRelationFilterSchema = z.strictObject({
    every: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
    some: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
    none: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
});
export const PushTokenListRelationFilterSchema = z.strictObject({
    every: z.lazy(() => PushTokenWhereInputSchema).optional(),
    some: z.lazy(() => PushTokenWhereInputSchema).optional(),
    none: z.lazy(() => PushTokenWhereInputSchema).optional(),
});
export const VendorCustomersOrderByRelationAggregateInputSchema = z.strictObject({
    _count: z.lazy(() => SortOrderSchema).optional(),
});
export const PushTokenOrderByRelationAggregateInputSchema = z.strictObject({
    _count: z.lazy(() => SortOrderSchema).optional(),
});
export const UserCountOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    phone: z.lazy(() => SortOrderSchema).optional(),
    address: z.lazy(() => SortOrderSchema).optional(),
    role: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const UserMaxOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    phone: z.lazy(() => SortOrderSchema).optional(),
    address: z.lazy(() => SortOrderSchema).optional(),
    role: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const UserMinOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    phone: z.lazy(() => SortOrderSchema).optional(),
    address: z.lazy(() => SortOrderSchema).optional(),
    role: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const StringWithAggregatesFilterSchema = z.strictObject({
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
    not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedStringFilterSchema).optional(),
    _max: z.lazy(() => NestedStringFilterSchema).optional(),
});
export const EnumRoleWithAggregatesFilterSchema = z.strictObject({
    equals: z.lazy(() => RoleSchema).optional(),
    in: z.lazy(() => RoleSchema).array().optional(),
    notIn: z.lazy(() => RoleSchema).array().optional(),
    not: z.union([z.lazy(() => RoleSchema), z.lazy(() => NestedEnumRoleWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
});
export const DateTimeWithAggregatesFilterSchema = z.strictObject({
    equals: z.coerce.date().optional(),
    in: z.coerce.date().array().optional(),
    notIn: z.coerce.date().array().optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
});
export const UserScalarRelationFilterSchema = z.strictObject({
    is: z.lazy(() => UserWhereInputSchema).optional(),
    isNot: z.lazy(() => UserWhereInputSchema).optional(),
});
export const ProductListRelationFilterSchema = z.strictObject({
    every: z.lazy(() => ProductWhereInputSchema).optional(),
    some: z.lazy(() => ProductWhereInputSchema).optional(),
    none: z.lazy(() => ProductWhereInputSchema).optional(),
});
export const ProductOrderByRelationAggregateInputSchema = z.strictObject({
    _count: z.lazy(() => SortOrderSchema).optional(),
});
export const VendorCountOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userId: z.lazy(() => SortOrderSchema).optional(),
    businessName: z.lazy(() => SortOrderSchema).optional(),
    businessPhone: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const VendorMaxOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userId: z.lazy(() => SortOrderSchema).optional(),
    businessName: z.lazy(() => SortOrderSchema).optional(),
    businessPhone: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const VendorMinOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userId: z.lazy(() => SortOrderSchema).optional(),
    businessName: z.lazy(() => SortOrderSchema).optional(),
    businessPhone: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const EnumProductUnitFilterSchema = z.strictObject({
    equals: z.lazy(() => ProductUnitSchema).optional(),
    in: z.lazy(() => ProductUnitSchema).array().optional(),
    notIn: z.lazy(() => ProductUnitSchema).array().optional(),
    not: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => NestedEnumProductUnitFilterSchema)]).optional(),
});
export const VendorScalarRelationFilterSchema = z.strictObject({
    is: z.lazy(() => VendorWhereInputSchema).optional(),
    isNot: z.lazy(() => VendorWhereInputSchema).optional(),
});
export const CustomerSubscriptionListRelationFilterSchema = z.strictObject({
    every: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
    some: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
    none: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
});
export const RequestsListRelationFilterSchema = z.strictObject({
    every: z.lazy(() => RequestsWhereInputSchema).optional(),
    some: z.lazy(() => RequestsWhereInputSchema).optional(),
    none: z.lazy(() => RequestsWhereInputSchema).optional(),
});
export const CustomerSubscriptionOrderByRelationAggregateInputSchema = z.strictObject({
    _count: z.lazy(() => SortOrderSchema).optional(),
});
export const RequestsOrderByRelationAggregateInputSchema = z.strictObject({
    _count: z.lazy(() => SortOrderSchema).optional(),
});
export const ProductCountOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    vendorId: z.lazy(() => SortOrderSchema).optional(),
    productName: z.lazy(() => SortOrderSchema).optional(),
    description: z.lazy(() => SortOrderSchema).optional(),
    unit: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const ProductMaxOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    vendorId: z.lazy(() => SortOrderSchema).optional(),
    productName: z.lazy(() => SortOrderSchema).optional(),
    description: z.lazy(() => SortOrderSchema).optional(),
    unit: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const ProductMinOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    vendorId: z.lazy(() => SortOrderSchema).optional(),
    productName: z.lazy(() => SortOrderSchema).optional(),
    description: z.lazy(() => SortOrderSchema).optional(),
    unit: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const EnumProductUnitWithAggregatesFilterSchema = z.strictObject({
    equals: z.lazy(() => ProductUnitSchema).optional(),
    in: z.lazy(() => ProductUnitSchema).array().optional(),
    notIn: z.lazy(() => ProductUnitSchema).array().optional(),
    not: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => NestedEnumProductUnitWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumProductUnitFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumProductUnitFilterSchema).optional(),
});
export const VendorCustomersVendorIdCustomerIdCompoundUniqueInputSchema = z.strictObject({
    vendorId: z.string(),
    customerId: z.string(),
});
export const VendorCustomersCountOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    vendorId: z.lazy(() => SortOrderSchema).optional(),
    customerId: z.lazy(() => SortOrderSchema).optional(),
    customerPhone: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const VendorCustomersMaxOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    vendorId: z.lazy(() => SortOrderSchema).optional(),
    customerId: z.lazy(() => SortOrderSchema).optional(),
    customerPhone: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const VendorCustomersMinOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    vendorId: z.lazy(() => SortOrderSchema).optional(),
    customerId: z.lazy(() => SortOrderSchema).optional(),
    customerPhone: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const DecimalFilterSchema = z.strictObject({
    equals: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    in: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
    notIn: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
    lt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    lte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    not: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NestedDecimalFilterSchema)]).optional(),
});
export const VendorCustomersScalarRelationFilterSchema = z.strictObject({
    is: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
    isNot: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
});
export const ProductScalarRelationFilterSchema = z.strictObject({
    is: z.lazy(() => ProductWhereInputSchema).optional(),
    isNot: z.lazy(() => ProductWhereInputSchema).optional(),
});
export const CustomerSubscriptionVendorCustomerIdProductIdCompoundUniqueInputSchema = z.strictObject({
    vendorCustomerId: z.string(),
    productId: z.string(),
});
export const CustomerSubscriptionCountOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
    productId: z.lazy(() => SortOrderSchema).optional(),
    startDate: z.lazy(() => SortOrderSchema).optional(),
    dailyQuantity: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const CustomerSubscriptionAvgOrderByAggregateInputSchema = z.strictObject({
    dailyQuantity: z.lazy(() => SortOrderSchema).optional(),
});
export const CustomerSubscriptionMaxOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
    productId: z.lazy(() => SortOrderSchema).optional(),
    startDate: z.lazy(() => SortOrderSchema).optional(),
    dailyQuantity: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const CustomerSubscriptionMinOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    vendorCustomerId: z.lazy(() => SortOrderSchema).optional(),
    productId: z.lazy(() => SortOrderSchema).optional(),
    startDate: z.lazy(() => SortOrderSchema).optional(),
    dailyQuantity: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
});
export const CustomerSubscriptionSumOrderByAggregateInputSchema = z.strictObject({
    dailyQuantity: z.lazy(() => SortOrderSchema).optional(),
});
export const DecimalWithAggregatesFilterSchema = z.strictObject({
    equals: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    in: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
    notIn: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
    lt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    lte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    not: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NestedDecimalWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
    _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
    _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
    _max: z.lazy(() => NestedDecimalFilterSchema).optional(),
});
export const EnumRequestTypeFilterSchema = z.strictObject({
    equals: z.lazy(() => RequestTypeSchema).optional(),
    in: z.lazy(() => RequestTypeSchema).array().optional(),
    notIn: z.lazy(() => RequestTypeSchema).array().optional(),
    not: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => NestedEnumRequestTypeFilterSchema)]).optional(),
});
export const DecimalNullableFilterSchema = z.strictObject({
    equals: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    in: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
    notIn: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
    lt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    lte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    not: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NestedDecimalNullableFilterSchema)]).optional().nullable(),
});
export const EnumStatusFilterSchema = z.strictObject({
    equals: z.lazy(() => StatusSchema).optional(),
    in: z.lazy(() => StatusSchema).array().optional(),
    notIn: z.lazy(() => StatusSchema).array().optional(),
    not: z.union([z.lazy(() => StatusSchema), z.lazy(() => NestedEnumStatusFilterSchema)]).optional(),
});
export const DateTimeNullableFilterSchema = z.strictObject({
    equals: z.coerce.date().optional().nullable(),
    in: z.coerce.date().array().optional().nullable(),
    notIn: z.coerce.date().array().optional().nullable(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableFilterSchema)]).optional().nullable(),
});
export const CustomerSubscriptionScalarRelationFilterSchema = z.strictObject({
    is: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
    isNot: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
});
export const SortOrderInputSchema = z.strictObject({
    sort: z.lazy(() => SortOrderSchema),
    nulls: z.lazy(() => NullsOrderSchema).optional(),
});
export const RequestsCountOrderByAggregateInputSchema = z.strictObject({
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
export const RequestsAvgOrderByAggregateInputSchema = z.strictObject({
    requestedQuantity: z.lazy(() => SortOrderSchema).optional(),
});
export const RequestsMaxOrderByAggregateInputSchema = z.strictObject({
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
export const RequestsMinOrderByAggregateInputSchema = z.strictObject({
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
export const RequestsSumOrderByAggregateInputSchema = z.strictObject({
    requestedQuantity: z.lazy(() => SortOrderSchema).optional(),
});
export const EnumRequestTypeWithAggregatesFilterSchema = z.strictObject({
    equals: z.lazy(() => RequestTypeSchema).optional(),
    in: z.lazy(() => RequestTypeSchema).array().optional(),
    notIn: z.lazy(() => RequestTypeSchema).array().optional(),
    not: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => NestedEnumRequestTypeWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumRequestTypeFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumRequestTypeFilterSchema).optional(),
});
export const DecimalNullableWithAggregatesFilterSchema = z.strictObject({
    equals: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    in: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
    notIn: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
    lt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    lte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    not: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NestedDecimalNullableWithAggregatesFilterSchema)]).optional().nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _avg: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
    _sum: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
});
export const EnumStatusWithAggregatesFilterSchema = z.strictObject({
    equals: z.lazy(() => StatusSchema).optional(),
    in: z.lazy(() => StatusSchema).array().optional(),
    notIn: z.lazy(() => StatusSchema).array().optional(),
    not: z.union([z.lazy(() => StatusSchema), z.lazy(() => NestedEnumStatusWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumStatusFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumStatusFilterSchema).optional(),
});
export const DateTimeNullableWithAggregatesFilterSchema = z.strictObject({
    equals: z.coerce.date().optional().nullable(),
    in: z.coerce.date().array().optional().nullable(),
    notIn: z.coerce.date().array().optional().nullable(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema)]).optional().nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
});
export const EnumPlatformFilterSchema = z.strictObject({
    equals: z.lazy(() => PlatformSchema).optional(),
    in: z.lazy(() => PlatformSchema).array().optional(),
    notIn: z.lazy(() => PlatformSchema).array().optional(),
    not: z.union([z.lazy(() => PlatformSchema), z.lazy(() => NestedEnumPlatformFilterSchema)]).optional(),
});
export const PushTokenCountOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    token: z.lazy(() => SortOrderSchema).optional(),
    platform: z.lazy(() => SortOrderSchema).optional(),
    userId: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
});
export const PushTokenMaxOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    token: z.lazy(() => SortOrderSchema).optional(),
    platform: z.lazy(() => SortOrderSchema).optional(),
    userId: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
});
export const PushTokenMinOrderByAggregateInputSchema = z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    token: z.lazy(() => SortOrderSchema).optional(),
    platform: z.lazy(() => SortOrderSchema).optional(),
    userId: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
});
export const EnumPlatformWithAggregatesFilterSchema = z.strictObject({
    equals: z.lazy(() => PlatformSchema).optional(),
    in: z.lazy(() => PlatformSchema).array().optional(),
    notIn: z.lazy(() => PlatformSchema).array().optional(),
    not: z.union([z.lazy(() => PlatformSchema), z.lazy(() => NestedEnumPlatformWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumPlatformFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumPlatformFilterSchema).optional(),
});
export const VendorCreateNestedOneWithoutUserInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCreateWithoutUserInputSchema), z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema).optional(),
    connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
});
export const VendorCustomersCreateNestedManyWithoutUserInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateWithoutUserInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema).array()]).optional(),
    createMany: z.lazy(() => VendorCustomersCreateManyUserInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
});
export const PushTokenCreateNestedManyWithoutUserInputSchema = z.strictObject({
    create: z.union([z.lazy(() => PushTokenCreateWithoutUserInputSchema), z.lazy(() => PushTokenCreateWithoutUserInputSchema).array(), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema), z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema).array()]).optional(),
    createMany: z.lazy(() => PushTokenCreateManyUserInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array()]).optional(),
});
export const VendorUncheckedCreateNestedOneWithoutUserInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCreateWithoutUserInputSchema), z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema).optional(),
    connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
});
export const VendorCustomersUncheckedCreateNestedManyWithoutUserInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateWithoutUserInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema).array()]).optional(),
    createMany: z.lazy(() => VendorCustomersCreateManyUserInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
});
export const PushTokenUncheckedCreateNestedManyWithoutUserInputSchema = z.strictObject({
    create: z.union([z.lazy(() => PushTokenCreateWithoutUserInputSchema), z.lazy(() => PushTokenCreateWithoutUserInputSchema).array(), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema), z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema).array()]).optional(),
    createMany: z.lazy(() => PushTokenCreateManyUserInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array()]).optional(),
});
export const StringFieldUpdateOperationsInputSchema = z.strictObject({
    set: z.string().optional(),
});
export const EnumRoleFieldUpdateOperationsInputSchema = z.strictObject({
    set: z.lazy(() => RoleSchema).optional(),
});
export const DateTimeFieldUpdateOperationsInputSchema = z.strictObject({
    set: z.coerce.date().optional(),
});
export const VendorUpdateOneWithoutUserNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCreateWithoutUserInputSchema), z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema).optional(),
    upsert: z.lazy(() => VendorUpsertWithoutUserInputSchema).optional(),
    disconnect: z.union([z.boolean(), z.lazy(() => VendorWhereInputSchema)]).optional(),
    delete: z.union([z.boolean(), z.lazy(() => VendorWhereInputSchema)]).optional(),
    connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
    update: z.union([z.lazy(() => VendorUpdateToOneWithWhereWithoutUserInputSchema), z.lazy(() => VendorUpdateWithoutUserInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutUserInputSchema)]).optional(),
});
export const VendorCustomersUpdateManyWithoutUserNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateWithoutUserInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutUserInputSchema).array()]).optional(),
    createMany: z.lazy(() => VendorCustomersCreateManyUserInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutUserInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutUserInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => VendorCustomersScalarWhereInputSchema), z.lazy(() => VendorCustomersScalarWhereInputSchema).array()]).optional(),
});
export const PushTokenUpdateManyWithoutUserNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => PushTokenCreateWithoutUserInputSchema), z.lazy(() => PushTokenCreateWithoutUserInputSchema).array(), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema), z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => PushTokenUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => PushTokenUpsertWithWhereUniqueWithoutUserInputSchema).array()]).optional(),
    createMany: z.lazy(() => PushTokenCreateManyUserInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => PushTokenUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => PushTokenUpdateWithWhereUniqueWithoutUserInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => PushTokenUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => PushTokenUpdateManyWithWhereWithoutUserInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => PushTokenScalarWhereInputSchema), z.lazy(() => PushTokenScalarWhereInputSchema).array()]).optional(),
});
export const VendorUncheckedUpdateOneWithoutUserNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCreateWithoutUserInputSchema), z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema).optional(),
    upsert: z.lazy(() => VendorUpsertWithoutUserInputSchema).optional(),
    disconnect: z.union([z.boolean(), z.lazy(() => VendorWhereInputSchema)]).optional(),
    delete: z.union([z.boolean(), z.lazy(() => VendorWhereInputSchema)]).optional(),
    connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
    update: z.union([z.lazy(() => VendorUpdateToOneWithWhereWithoutUserInputSchema), z.lazy(() => VendorUpdateWithoutUserInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutUserInputSchema)]).optional(),
});
export const VendorCustomersUncheckedUpdateManyWithoutUserNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateWithoutUserInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutUserInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutUserInputSchema).array()]).optional(),
    createMany: z.lazy(() => VendorCustomersCreateManyUserInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutUserInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutUserInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => VendorCustomersScalarWhereInputSchema), z.lazy(() => VendorCustomersScalarWhereInputSchema).array()]).optional(),
});
export const PushTokenUncheckedUpdateManyWithoutUserNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => PushTokenCreateWithoutUserInputSchema), z.lazy(() => PushTokenCreateWithoutUserInputSchema).array(), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema), z.lazy(() => PushTokenCreateOrConnectWithoutUserInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => PushTokenUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => PushTokenUpsertWithWhereUniqueWithoutUserInputSchema).array()]).optional(),
    createMany: z.lazy(() => PushTokenCreateManyUserInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => PushTokenWhereUniqueInputSchema), z.lazy(() => PushTokenWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => PushTokenUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => PushTokenUpdateWithWhereUniqueWithoutUserInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => PushTokenUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => PushTokenUpdateManyWithWhereWithoutUserInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => PushTokenScalarWhereInputSchema), z.lazy(() => PushTokenScalarWhereInputSchema).array()]).optional(),
});
export const UserCreateNestedOneWithoutVendorInputSchema = z.strictObject({
    create: z.union([z.lazy(() => UserCreateWithoutVendorInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutVendorInputSchema).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});
export const ProductCreateNestedManyWithoutVendorInputSchema = z.strictObject({
    create: z.union([z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductCreateWithoutVendorInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema), z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema).array()]).optional(),
    createMany: z.lazy(() => ProductCreateManyVendorInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array()]).optional(),
});
export const VendorCustomersCreateNestedManyWithoutVendorInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema).array()]).optional(),
    createMany: z.lazy(() => VendorCustomersCreateManyVendorInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
});
export const ProductUncheckedCreateNestedManyWithoutVendorInputSchema = z.strictObject({
    create: z.union([z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductCreateWithoutVendorInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema), z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema).array()]).optional(),
    createMany: z.lazy(() => ProductCreateManyVendorInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array()]).optional(),
});
export const VendorCustomersUncheckedCreateNestedManyWithoutVendorInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema).array()]).optional(),
    createMany: z.lazy(() => VendorCustomersCreateManyVendorInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
});
export const UserUpdateOneRequiredWithoutVendorNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => UserCreateWithoutVendorInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutVendorInputSchema).optional(),
    upsert: z.lazy(() => UserUpsertWithoutVendorInputSchema).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    update: z.union([z.lazy(() => UserUpdateToOneWithWhereWithoutVendorInputSchema), z.lazy(() => UserUpdateWithoutVendorInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVendorInputSchema)]).optional(),
});
export const ProductUpdateManyWithoutVendorNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductCreateWithoutVendorInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema), z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => ProductUpsertWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => ProductUpsertWithWhereUniqueWithoutVendorInputSchema).array()]).optional(),
    createMany: z.lazy(() => ProductCreateManyVendorInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => ProductUpdateWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => ProductUpdateWithWhereUniqueWithoutVendorInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => ProductUpdateManyWithWhereWithoutVendorInputSchema), z.lazy(() => ProductUpdateManyWithWhereWithoutVendorInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array()]).optional(),
});
export const VendorCustomersUpdateManyWithoutVendorNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutVendorInputSchema).array()]).optional(),
    createMany: z.lazy(() => VendorCustomersCreateManyVendorInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutVendorInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutVendorInputSchema), z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutVendorInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => VendorCustomersScalarWhereInputSchema), z.lazy(() => VendorCustomersScalarWhereInputSchema).array()]).optional(),
});
export const ProductUncheckedUpdateManyWithoutVendorNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductCreateWithoutVendorInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema), z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => ProductUpsertWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => ProductUpsertWithWhereUniqueWithoutVendorInputSchema).array()]).optional(),
    createMany: z.lazy(() => ProductCreateManyVendorInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => ProductUpdateWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => ProductUpdateWithWhereUniqueWithoutVendorInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => ProductUpdateManyWithWhereWithoutVendorInputSchema), z.lazy(() => ProductUpdateManyWithWhereWithoutVendorInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array()]).optional(),
});
export const VendorCustomersUncheckedUpdateManyWithoutVendorNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema).array(), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema), z.lazy(() => VendorCustomersCreateOrConnectWithoutVendorInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => VendorCustomersUpsertWithWhereUniqueWithoutVendorInputSchema).array()]).optional(),
    createMany: z.lazy(() => VendorCustomersCreateManyVendorInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => VendorCustomersWhereUniqueInputSchema), z.lazy(() => VendorCustomersWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => VendorCustomersUpdateWithWhereUniqueWithoutVendorInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutVendorInputSchema), z.lazy(() => VendorCustomersUpdateManyWithWhereWithoutVendorInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => VendorCustomersScalarWhereInputSchema), z.lazy(() => VendorCustomersScalarWhereInputSchema).array()]).optional(),
});
export const VendorCreateNestedOneWithoutProductInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCreateWithoutProductInputSchema), z.lazy(() => VendorUncheckedCreateWithoutProductInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutProductInputSchema).optional(),
    connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
});
export const CustomerSubscriptionCreateNestedManyWithoutProductInputSchema = z.strictObject({
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema).array()]).optional(),
    createMany: z.lazy(() => CustomerSubscriptionCreateManyProductInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
});
export const RequestsCreateNestedManyWithoutProductInputSchema = z.strictObject({
    create: z.union([z.lazy(() => RequestsCreateWithoutProductInputSchema), z.lazy(() => RequestsCreateWithoutProductInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema).array()]).optional(),
    createMany: z.lazy(() => RequestsCreateManyProductInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
});
export const CustomerSubscriptionUncheckedCreateNestedManyWithoutProductInputSchema = z.strictObject({
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema).array()]).optional(),
    createMany: z.lazy(() => CustomerSubscriptionCreateManyProductInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
});
export const RequestsUncheckedCreateNestedManyWithoutProductInputSchema = z.strictObject({
    create: z.union([z.lazy(() => RequestsCreateWithoutProductInputSchema), z.lazy(() => RequestsCreateWithoutProductInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema).array()]).optional(),
    createMany: z.lazy(() => RequestsCreateManyProductInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
});
export const EnumProductUnitFieldUpdateOperationsInputSchema = z.strictObject({
    set: z.lazy(() => ProductUnitSchema).optional(),
});
export const VendorUpdateOneRequiredWithoutProductNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCreateWithoutProductInputSchema), z.lazy(() => VendorUncheckedCreateWithoutProductInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutProductInputSchema).optional(),
    upsert: z.lazy(() => VendorUpsertWithoutProductInputSchema).optional(),
    connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
    update: z.union([z.lazy(() => VendorUpdateToOneWithWhereWithoutProductInputSchema), z.lazy(() => VendorUpdateWithoutProductInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutProductInputSchema)]).optional(),
});
export const CustomerSubscriptionUpdateManyWithoutProductNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutProductInputSchema).array()]).optional(),
    createMany: z.lazy(() => CustomerSubscriptionCreateManyProductInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutProductInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutProductInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => CustomerSubscriptionScalarWhereInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array()]).optional(),
});
export const RequestsUpdateManyWithoutProductNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => RequestsCreateWithoutProductInputSchema), z.lazy(() => RequestsCreateWithoutProductInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => RequestsUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => RequestsUpsertWithWhereUniqueWithoutProductInputSchema).array()]).optional(),
    createMany: z.lazy(() => RequestsCreateManyProductInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => RequestsUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => RequestsUpdateWithWhereUniqueWithoutProductInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => RequestsUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => RequestsUpdateManyWithWhereWithoutProductInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array()]).optional(),
});
export const CustomerSubscriptionUncheckedUpdateManyWithoutProductNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutProductInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutProductInputSchema).array()]).optional(),
    createMany: z.lazy(() => CustomerSubscriptionCreateManyProductInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutProductInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutProductInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => CustomerSubscriptionScalarWhereInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array()]).optional(),
});
export const RequestsUncheckedUpdateManyWithoutProductNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => RequestsCreateWithoutProductInputSchema), z.lazy(() => RequestsCreateWithoutProductInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutProductInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => RequestsUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => RequestsUpsertWithWhereUniqueWithoutProductInputSchema).array()]).optional(),
    createMany: z.lazy(() => RequestsCreateManyProductInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => RequestsUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => RequestsUpdateWithWhereUniqueWithoutProductInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => RequestsUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => RequestsUpdateManyWithWhereWithoutProductInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array()]).optional(),
});
export const VendorCreateNestedOneWithoutVendorcustomersInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCreateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedCreateWithoutVendorcustomersInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutVendorcustomersInputSchema).optional(),
    connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
});
export const UserCreateNestedOneWithoutVendorcustomersInputSchema = z.strictObject({
    create: z.union([z.lazy(() => UserCreateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorcustomersInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutVendorcustomersInputSchema).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});
export const CustomerSubscriptionCreateNestedManyWithoutVendorCustomersInputSchema = z.strictObject({
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema).array()]).optional(),
    createMany: z.lazy(() => CustomerSubscriptionCreateManyVendorCustomersInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
});
export const RequestsCreateNestedManyWithoutVendorCustomersInputSchema = z.strictObject({
    create: z.union([z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema).array()]).optional(),
    createMany: z.lazy(() => RequestsCreateManyVendorCustomersInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
});
export const CustomerSubscriptionUncheckedCreateNestedManyWithoutVendorCustomersInputSchema = z.strictObject({
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema).array()]).optional(),
    createMany: z.lazy(() => CustomerSubscriptionCreateManyVendorCustomersInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
});
export const RequestsUncheckedCreateNestedManyWithoutVendorCustomersInputSchema = z.strictObject({
    create: z.union([z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema).array()]).optional(),
    createMany: z.lazy(() => RequestsCreateManyVendorCustomersInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
});
export const VendorUpdateOneRequiredWithoutVendorcustomersNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCreateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedCreateWithoutVendorcustomersInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => VendorCreateOrConnectWithoutVendorcustomersInputSchema).optional(),
    upsert: z.lazy(() => VendorUpsertWithoutVendorcustomersInputSchema).optional(),
    connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
    update: z.union([z.lazy(() => VendorUpdateToOneWithWhereWithoutVendorcustomersInputSchema), z.lazy(() => VendorUpdateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutVendorcustomersInputSchema)]).optional(),
});
export const UserUpdateOneRequiredWithoutVendorcustomersNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => UserCreateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorcustomersInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutVendorcustomersInputSchema).optional(),
    upsert: z.lazy(() => UserUpsertWithoutVendorcustomersInputSchema).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    update: z.union([z.lazy(() => UserUpdateToOneWithWhereWithoutVendorcustomersInputSchema), z.lazy(() => UserUpdateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVendorcustomersInputSchema)]).optional(),
});
export const CustomerSubscriptionUpdateManyWithoutVendorCustomersNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutVendorCustomersInputSchema).array()]).optional(),
    createMany: z.lazy(() => CustomerSubscriptionCreateManyVendorCustomersInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutVendorCustomersInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutVendorCustomersInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => CustomerSubscriptionScalarWhereInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array()]).optional(),
});
export const RequestsUpdateManyWithoutVendorCustomersNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => RequestsUpsertWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUpsertWithWhereUniqueWithoutVendorCustomersInputSchema).array()]).optional(),
    createMany: z.lazy(() => RequestsCreateManyVendorCustomersInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => RequestsUpdateWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUpdateWithWhereUniqueWithoutVendorCustomersInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => RequestsUpdateManyWithWhereWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUpdateManyWithWhereWithoutVendorCustomersInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array()]).optional(),
});
export const CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUpsertWithWhereUniqueWithoutVendorCustomersInputSchema).array()]).optional(),
    createMany: z.lazy(() => CustomerSubscriptionCreateManyVendorCustomersInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema), z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUpdateWithWhereUniqueWithoutVendorCustomersInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUpdateManyWithWhereWithoutVendorCustomersInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => CustomerSubscriptionScalarWhereInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array()]).optional(),
});
export const RequestsUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutVendorCustomersInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => RequestsUpsertWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUpsertWithWhereUniqueWithoutVendorCustomersInputSchema).array()]).optional(),
    createMany: z.lazy(() => RequestsCreateManyVendorCustomersInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => RequestsUpdateWithWhereUniqueWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUpdateWithWhereUniqueWithoutVendorCustomersInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => RequestsUpdateManyWithWhereWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUpdateManyWithWhereWithoutVendorCustomersInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array()]).optional(),
});
export const VendorCustomersCreateNestedOneWithoutSubscriptionInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutSubscriptionInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => VendorCustomersCreateOrConnectWithoutSubscriptionInputSchema).optional(),
    connect: z.lazy(() => VendorCustomersWhereUniqueInputSchema).optional(),
});
export const ProductCreateNestedOneWithoutSubscriptionInputSchema = z.strictObject({
    create: z.union([z.lazy(() => ProductCreateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSubscriptionInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutSubscriptionInputSchema).optional(),
    connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
});
export const RequestsCreateNestedManyWithoutSubscriptionInputSchema = z.strictObject({
    create: z.union([z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema).array()]).optional(),
    createMany: z.lazy(() => RequestsCreateManySubscriptionInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
});
export const RequestsUncheckedCreateNestedManyWithoutSubscriptionInputSchema = z.strictObject({
    create: z.union([z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema).array()]).optional(),
    createMany: z.lazy(() => RequestsCreateManySubscriptionInputEnvelopeSchema).optional(),
    connect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
});
export const DecimalFieldUpdateOperationsInputSchema = z.strictObject({
    set: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    increment: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    decrement: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    multiply: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    divide: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
});
export const VendorCustomersUpdateOneRequiredWithoutSubscriptionNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutSubscriptionInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => VendorCustomersCreateOrConnectWithoutSubscriptionInputSchema).optional(),
    upsert: z.lazy(() => VendorCustomersUpsertWithoutSubscriptionInputSchema).optional(),
    connect: z.lazy(() => VendorCustomersWhereUniqueInputSchema).optional(),
    update: z.union([z.lazy(() => VendorCustomersUpdateToOneWithWhereWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUpdateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutSubscriptionInputSchema)]).optional(),
});
export const ProductUpdateOneRequiredWithoutSubscriptionNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => ProductCreateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSubscriptionInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutSubscriptionInputSchema).optional(),
    upsert: z.lazy(() => ProductUpsertWithoutSubscriptionInputSchema).optional(),
    connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
    update: z.union([z.lazy(() => ProductUpdateToOneWithWhereWithoutSubscriptionInputSchema), z.lazy(() => ProductUpdateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutSubscriptionInputSchema)]).optional(),
});
export const RequestsUpdateManyWithoutSubscriptionNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => RequestsUpsertWithWhereUniqueWithoutSubscriptionInputSchema), z.lazy(() => RequestsUpsertWithWhereUniqueWithoutSubscriptionInputSchema).array()]).optional(),
    createMany: z.lazy(() => RequestsCreateManySubscriptionInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => RequestsUpdateWithWhereUniqueWithoutSubscriptionInputSchema), z.lazy(() => RequestsUpdateWithWhereUniqueWithoutSubscriptionInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => RequestsUpdateManyWithWhereWithoutSubscriptionInputSchema), z.lazy(() => RequestsUpdateManyWithWhereWithoutSubscriptionInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array()]).optional(),
});
export const RequestsUncheckedUpdateManyWithoutSubscriptionNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema).array(), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema).array()]).optional(),
    connectOrCreate: z.union([z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema), z.lazy(() => RequestsCreateOrConnectWithoutSubscriptionInputSchema).array()]).optional(),
    upsert: z.union([z.lazy(() => RequestsUpsertWithWhereUniqueWithoutSubscriptionInputSchema), z.lazy(() => RequestsUpsertWithWhereUniqueWithoutSubscriptionInputSchema).array()]).optional(),
    createMany: z.lazy(() => RequestsCreateManySubscriptionInputEnvelopeSchema).optional(),
    set: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    disconnect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    delete: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    connect: z.union([z.lazy(() => RequestsWhereUniqueInputSchema), z.lazy(() => RequestsWhereUniqueInputSchema).array()]).optional(),
    update: z.union([z.lazy(() => RequestsUpdateWithWhereUniqueWithoutSubscriptionInputSchema), z.lazy(() => RequestsUpdateWithWhereUniqueWithoutSubscriptionInputSchema).array()]).optional(),
    updateMany: z.union([z.lazy(() => RequestsUpdateManyWithWhereWithoutSubscriptionInputSchema), z.lazy(() => RequestsUpdateManyWithWhereWithoutSubscriptionInputSchema).array()]).optional(),
    deleteMany: z.union([z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array()]).optional(),
});
export const VendorCustomersCreateNestedOneWithoutRequestInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutRequestInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => VendorCustomersCreateOrConnectWithoutRequestInputSchema).optional(),
    connect: z.lazy(() => VendorCustomersWhereUniqueInputSchema).optional(),
});
export const ProductCreateNestedOneWithoutRequestInputSchema = z.strictObject({
    create: z.union([z.lazy(() => ProductCreateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedCreateWithoutRequestInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutRequestInputSchema).optional(),
    connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
});
export const CustomerSubscriptionCreateNestedOneWithoutRequestsInputSchema = z.strictObject({
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutRequestsInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutRequestsInputSchema).optional(),
    connect: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).optional(),
});
export const EnumRequestTypeFieldUpdateOperationsInputSchema = z.strictObject({
    set: z.lazy(() => RequestTypeSchema).optional(),
});
export const NullableDecimalFieldUpdateOperationsInputSchema = z.strictObject({
    set: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    increment: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    decrement: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    multiply: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    divide: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
});
export const EnumStatusFieldUpdateOperationsInputSchema = z.strictObject({
    set: z.lazy(() => StatusSchema).optional(),
});
export const NullableDateTimeFieldUpdateOperationsInputSchema = z.strictObject({
    set: z.coerce.date().optional().nullable(),
});
export const VendorCustomersUpdateOneRequiredWithoutRequestNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutRequestInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => VendorCustomersCreateOrConnectWithoutRequestInputSchema).optional(),
    upsert: z.lazy(() => VendorCustomersUpsertWithoutRequestInputSchema).optional(),
    connect: z.lazy(() => VendorCustomersWhereUniqueInputSchema).optional(),
    update: z.union([z.lazy(() => VendorCustomersUpdateToOneWithWhereWithoutRequestInputSchema), z.lazy(() => VendorCustomersUpdateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutRequestInputSchema)]).optional(),
});
export const ProductUpdateOneRequiredWithoutRequestNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => ProductCreateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedCreateWithoutRequestInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutRequestInputSchema).optional(),
    upsert: z.lazy(() => ProductUpsertWithoutRequestInputSchema).optional(),
    connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
    update: z.union([z.lazy(() => ProductUpdateToOneWithWhereWithoutRequestInputSchema), z.lazy(() => ProductUpdateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutRequestInputSchema)]).optional(),
});
export const CustomerSubscriptionUpdateOneRequiredWithoutRequestsNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutRequestsInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => CustomerSubscriptionCreateOrConnectWithoutRequestsInputSchema).optional(),
    upsert: z.lazy(() => CustomerSubscriptionUpsertWithoutRequestsInputSchema).optional(),
    connect: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema).optional(),
    update: z.union([z.lazy(() => CustomerSubscriptionUpdateToOneWithWhereWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUpdateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutRequestsInputSchema)]).optional(),
});
export const UserCreateNestedOneWithoutPushTokenInputSchema = z.strictObject({
    create: z.union([z.lazy(() => UserCreateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedCreateWithoutPushTokenInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPushTokenInputSchema).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});
export const EnumPlatformFieldUpdateOperationsInputSchema = z.strictObject({
    set: z.lazy(() => PlatformSchema).optional(),
});
export const UserUpdateOneRequiredWithoutPushTokenNestedInputSchema = z.strictObject({
    create: z.union([z.lazy(() => UserCreateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedCreateWithoutPushTokenInputSchema)]).optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPushTokenInputSchema).optional(),
    upsert: z.lazy(() => UserUpsertWithoutPushTokenInputSchema).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    update: z.union([z.lazy(() => UserUpdateToOneWithWhereWithoutPushTokenInputSchema), z.lazy(() => UserUpdateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedUpdateWithoutPushTokenInputSchema)]).optional(),
});
export const NestedStringFilterSchema = z.strictObject({
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
    not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
});
export const NestedEnumRoleFilterSchema = z.strictObject({
    equals: z.lazy(() => RoleSchema).optional(),
    in: z.lazy(() => RoleSchema).array().optional(),
    notIn: z.lazy(() => RoleSchema).array().optional(),
    not: z.union([z.lazy(() => RoleSchema), z.lazy(() => NestedEnumRoleFilterSchema)]).optional(),
});
export const NestedDateTimeFilterSchema = z.strictObject({
    equals: z.coerce.date().optional(),
    in: z.coerce.date().array().optional(),
    notIn: z.coerce.date().array().optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)]).optional(),
});
export const NestedStringWithAggregatesFilterSchema = z.strictObject({
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
    not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedStringFilterSchema).optional(),
    _max: z.lazy(() => NestedStringFilterSchema).optional(),
});
export const NestedIntFilterSchema = z.strictObject({
    equals: z.number().optional(),
    in: z.number().array().optional(),
    notIn: z.number().array().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z.union([z.number(), z.lazy(() => NestedIntFilterSchema)]).optional(),
});
export const NestedEnumRoleWithAggregatesFilterSchema = z.strictObject({
    equals: z.lazy(() => RoleSchema).optional(),
    in: z.lazy(() => RoleSchema).array().optional(),
    notIn: z.lazy(() => RoleSchema).array().optional(),
    not: z.union([z.lazy(() => RoleSchema), z.lazy(() => NestedEnumRoleWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
});
export const NestedDateTimeWithAggregatesFilterSchema = z.strictObject({
    equals: z.coerce.date().optional(),
    in: z.coerce.date().array().optional(),
    notIn: z.coerce.date().array().optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
});
export const NestedEnumProductUnitFilterSchema = z.strictObject({
    equals: z.lazy(() => ProductUnitSchema).optional(),
    in: z.lazy(() => ProductUnitSchema).array().optional(),
    notIn: z.lazy(() => ProductUnitSchema).array().optional(),
    not: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => NestedEnumProductUnitFilterSchema)]).optional(),
});
export const NestedEnumProductUnitWithAggregatesFilterSchema = z.strictObject({
    equals: z.lazy(() => ProductUnitSchema).optional(),
    in: z.lazy(() => ProductUnitSchema).array().optional(),
    notIn: z.lazy(() => ProductUnitSchema).array().optional(),
    not: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => NestedEnumProductUnitWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumProductUnitFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumProductUnitFilterSchema).optional(),
});
export const NestedDecimalFilterSchema = z.strictObject({
    equals: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    in: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
    notIn: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
    lt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    lte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    not: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NestedDecimalFilterSchema)]).optional(),
});
export const NestedDecimalWithAggregatesFilterSchema = z.strictObject({
    equals: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    in: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
    notIn: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
    lt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    lte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    not: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NestedDecimalWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
    _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
    _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
    _max: z.lazy(() => NestedDecimalFilterSchema).optional(),
});
export const NestedEnumRequestTypeFilterSchema = z.strictObject({
    equals: z.lazy(() => RequestTypeSchema).optional(),
    in: z.lazy(() => RequestTypeSchema).array().optional(),
    notIn: z.lazy(() => RequestTypeSchema).array().optional(),
    not: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => NestedEnumRequestTypeFilterSchema)]).optional(),
});
export const NestedDecimalNullableFilterSchema = z.strictObject({
    equals: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    in: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
    notIn: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
    lt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    lte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    not: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NestedDecimalNullableFilterSchema)]).optional().nullable(),
});
export const NestedEnumStatusFilterSchema = z.strictObject({
    equals: z.lazy(() => StatusSchema).optional(),
    in: z.lazy(() => StatusSchema).array().optional(),
    notIn: z.lazy(() => StatusSchema).array().optional(),
    not: z.union([z.lazy(() => StatusSchema), z.lazy(() => NestedEnumStatusFilterSchema)]).optional(),
});
export const NestedDateTimeNullableFilterSchema = z.strictObject({
    equals: z.coerce.date().optional().nullable(),
    in: z.coerce.date().array().optional().nullable(),
    notIn: z.coerce.date().array().optional().nullable(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableFilterSchema)]).optional().nullable(),
});
export const NestedEnumRequestTypeWithAggregatesFilterSchema = z.strictObject({
    equals: z.lazy(() => RequestTypeSchema).optional(),
    in: z.lazy(() => RequestTypeSchema).array().optional(),
    notIn: z.lazy(() => RequestTypeSchema).array().optional(),
    not: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => NestedEnumRequestTypeWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumRequestTypeFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumRequestTypeFilterSchema).optional(),
});
export const NestedDecimalNullableWithAggregatesFilterSchema = z.strictObject({
    equals: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    in: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
    notIn: z.union([z.number().array(), z.string().array(), z.instanceof(Prisma.Decimal).array(), DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && v.every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
    lt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    lte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gt: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    gte: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
    not: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NestedDecimalNullableWithAggregatesFilterSchema)]).optional().nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _avg: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
    _sum: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
});
export const NestedIntNullableFilterSchema = z.strictObject({
    equals: z.number().optional().nullable(),
    in: z.number().array().optional().nullable(),
    notIn: z.number().array().optional().nullable(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z.union([z.number(), z.lazy(() => NestedIntNullableFilterSchema)]).optional().nullable(),
});
export const NestedEnumStatusWithAggregatesFilterSchema = z.strictObject({
    equals: z.lazy(() => StatusSchema).optional(),
    in: z.lazy(() => StatusSchema).array().optional(),
    notIn: z.lazy(() => StatusSchema).array().optional(),
    not: z.union([z.lazy(() => StatusSchema), z.lazy(() => NestedEnumStatusWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumStatusFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumStatusFilterSchema).optional(),
});
export const NestedDateTimeNullableWithAggregatesFilterSchema = z.strictObject({
    equals: z.coerce.date().optional().nullable(),
    in: z.coerce.date().array().optional().nullable(),
    notIn: z.coerce.date().array().optional().nullable(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema)]).optional().nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
});
export const NestedEnumPlatformFilterSchema = z.strictObject({
    equals: z.lazy(() => PlatformSchema).optional(),
    in: z.lazy(() => PlatformSchema).array().optional(),
    notIn: z.lazy(() => PlatformSchema).array().optional(),
    not: z.union([z.lazy(() => PlatformSchema), z.lazy(() => NestedEnumPlatformFilterSchema)]).optional(),
});
export const NestedEnumPlatformWithAggregatesFilterSchema = z.strictObject({
    equals: z.lazy(() => PlatformSchema).optional(),
    in: z.lazy(() => PlatformSchema).array().optional(),
    notIn: z.lazy(() => PlatformSchema).array().optional(),
    not: z.union([z.lazy(() => PlatformSchema), z.lazy(() => NestedEnumPlatformWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumPlatformFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumPlatformFilterSchema).optional(),
});
export const VendorCreateWithoutUserInputSchema = z.strictObject({
    id: z.uuid().optional(),
    businessName: z.string().min(2, { message: "Business name must be at least 2 characters long" }),
    businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    product: z.lazy(() => ProductCreateNestedManyWithoutVendorInputSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersCreateNestedManyWithoutVendorInputSchema).optional(),
});
export const VendorUncheckedCreateWithoutUserInputSchema = z.strictObject({
    id: z.uuid().optional(),
    businessName: z.string().min(2, { message: "Business name must be at least 2 characters long" }),
    businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    product: z.lazy(() => ProductUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
});
export const VendorCreateOrConnectWithoutUserInputSchema = z.strictObject({
    where: z.lazy(() => VendorWhereUniqueInputSchema),
    create: z.union([z.lazy(() => VendorCreateWithoutUserInputSchema), z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema)]),
});
export const VendorCustomersCreateWithoutUserInputSchema = z.strictObject({
    id: z.uuid().optional(),
    customerPhone: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendor: z.lazy(() => VendorCreateNestedOneWithoutVendorcustomersInputSchema),
    subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
    request: z.lazy(() => RequestsCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});
export const VendorCustomersUncheckedCreateWithoutUserInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorId: z.string(),
    customerPhone: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
    request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});
export const VendorCustomersCreateOrConnectWithoutUserInputSchema = z.strictObject({
    where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema)]),
});
export const VendorCustomersCreateManyUserInputEnvelopeSchema = z.strictObject({
    data: z.union([z.lazy(() => VendorCustomersCreateManyUserInputSchema), z.lazy(() => VendorCustomersCreateManyUserInputSchema).array()]),
    skipDuplicates: z.boolean().optional(),
});
export const PushTokenCreateWithoutUserInputSchema = z.strictObject({
    id: z.cuid().optional(),
    token: z.string(),
    platform: z.lazy(() => PlatformSchema),
    createdAt: z.coerce.date().optional(),
});
export const PushTokenUncheckedCreateWithoutUserInputSchema = z.strictObject({
    id: z.cuid().optional(),
    token: z.string(),
    platform: z.lazy(() => PlatformSchema),
    createdAt: z.coerce.date().optional(),
});
export const PushTokenCreateOrConnectWithoutUserInputSchema = z.strictObject({
    where: z.lazy(() => PushTokenWhereUniqueInputSchema),
    create: z.union([z.lazy(() => PushTokenCreateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema)]),
});
export const PushTokenCreateManyUserInputEnvelopeSchema = z.strictObject({
    data: z.union([z.lazy(() => PushTokenCreateManyUserInputSchema), z.lazy(() => PushTokenCreateManyUserInputSchema).array()]),
    skipDuplicates: z.boolean().optional(),
});
export const VendorUpsertWithoutUserInputSchema = z.strictObject({
    update: z.union([z.lazy(() => VendorUpdateWithoutUserInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutUserInputSchema)]),
    create: z.union([z.lazy(() => VendorCreateWithoutUserInputSchema), z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema)]),
    where: z.lazy(() => VendorWhereInputSchema).optional(),
});
export const VendorUpdateToOneWithWhereWithoutUserInputSchema = z.strictObject({
    where: z.lazy(() => VendorWhereInputSchema).optional(),
    data: z.union([z.lazy(() => VendorUpdateWithoutUserInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutUserInputSchema)]),
});
export const VendorUpdateWithoutUserInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessName: z.union([z.string().min(2, { message: "Business name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessPhone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    product: z.lazy(() => ProductUpdateManyWithoutVendorNestedInputSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUpdateManyWithoutVendorNestedInputSchema).optional(),
});
export const VendorUncheckedUpdateWithoutUserInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessName: z.union([z.string().min(2, { message: "Business name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessPhone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    product: z.lazy(() => ProductUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
});
export const VendorCustomersUpsertWithWhereUniqueWithoutUserInputSchema = z.strictObject({
    where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
    update: z.union([z.lazy(() => VendorCustomersUpdateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutUserInputSchema)]),
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutUserInputSchema)]),
});
export const VendorCustomersUpdateWithWhereUniqueWithoutUserInputSchema = z.strictObject({
    where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
    data: z.union([z.lazy(() => VendorCustomersUpdateWithoutUserInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutUserInputSchema)]),
});
export const VendorCustomersUpdateManyWithWhereWithoutUserInputSchema = z.strictObject({
    where: z.lazy(() => VendorCustomersScalarWhereInputSchema),
    data: z.union([z.lazy(() => VendorCustomersUpdateManyMutationInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutUserInputSchema)]),
});
export const VendorCustomersScalarWhereInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => VendorCustomersScalarWhereInputSchema), z.lazy(() => VendorCustomersScalarWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => VendorCustomersScalarWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => VendorCustomersScalarWhereInputSchema), z.lazy(() => VendorCustomersScalarWhereInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    vendorId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    customerId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    customerPhone: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
});
export const PushTokenUpsertWithWhereUniqueWithoutUserInputSchema = z.strictObject({
    where: z.lazy(() => PushTokenWhereUniqueInputSchema),
    update: z.union([z.lazy(() => PushTokenUpdateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedUpdateWithoutUserInputSchema)]),
    create: z.union([z.lazy(() => PushTokenCreateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedCreateWithoutUserInputSchema)]),
});
export const PushTokenUpdateWithWhereUniqueWithoutUserInputSchema = z.strictObject({
    where: z.lazy(() => PushTokenWhereUniqueInputSchema),
    data: z.union([z.lazy(() => PushTokenUpdateWithoutUserInputSchema), z.lazy(() => PushTokenUncheckedUpdateWithoutUserInputSchema)]),
});
export const PushTokenUpdateManyWithWhereWithoutUserInputSchema = z.strictObject({
    where: z.lazy(() => PushTokenScalarWhereInputSchema),
    data: z.union([z.lazy(() => PushTokenUpdateManyMutationInputSchema), z.lazy(() => PushTokenUncheckedUpdateManyWithoutUserInputSchema)]),
});
export const PushTokenScalarWhereInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => PushTokenScalarWhereInputSchema), z.lazy(() => PushTokenScalarWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => PushTokenScalarWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => PushTokenScalarWhereInputSchema), z.lazy(() => PushTokenScalarWhereInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    token: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    platform: z.union([z.lazy(() => EnumPlatformFilterSchema), z.lazy(() => PlatformSchema)]).optional(),
    userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
});
export const UserCreateWithoutVendorInputSchema = z.strictObject({
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
export const UserUncheckedCreateWithoutVendorInputSchema = z.strictObject({
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
export const UserCreateOrConnectWithoutVendorInputSchema = z.strictObject({
    where: z.lazy(() => UserWhereUniqueInputSchema),
    create: z.union([z.lazy(() => UserCreateWithoutVendorInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorInputSchema)]),
});
export const ProductCreateWithoutVendorInputSchema = z.strictObject({
    id: z.uuid().optional(),
    productName: z.string().min(2, { message: "Product name must be of at least 2 characters" }),
    description: z.string().min(2, { message: "Product description must be of at leat 2 characters" }),
    unit: z.lazy(() => ProductUnitSchema),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutProductInputSchema).optional(),
    request: z.lazy(() => RequestsCreateNestedManyWithoutProductInputSchema).optional(),
});
export const ProductUncheckedCreateWithoutVendorInputSchema = z.strictObject({
    id: z.uuid().optional(),
    productName: z.string().min(2, { message: "Product name must be of at least 2 characters" }),
    description: z.string().min(2, { message: "Product description must be of at leat 2 characters" }),
    unit: z.lazy(() => ProductUnitSchema),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
    request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});
export const ProductCreateOrConnectWithoutVendorInputSchema = z.strictObject({
    where: z.lazy(() => ProductWhereUniqueInputSchema),
    create: z.union([z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema)]),
});
export const ProductCreateManyVendorInputEnvelopeSchema = z.strictObject({
    data: z.union([z.lazy(() => ProductCreateManyVendorInputSchema), z.lazy(() => ProductCreateManyVendorInputSchema).array()]),
    skipDuplicates: z.boolean().optional(),
});
export const VendorCustomersCreateWithoutVendorInputSchema = z.strictObject({
    id: z.uuid().optional(),
    customerPhone: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    user: z.lazy(() => UserCreateNestedOneWithoutVendorcustomersInputSchema),
    subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
    request: z.lazy(() => RequestsCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});
export const VendorCustomersUncheckedCreateWithoutVendorInputSchema = z.strictObject({
    id: z.uuid().optional(),
    customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    customerPhone: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
    request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});
export const VendorCustomersCreateOrConnectWithoutVendorInputSchema = z.strictObject({
    where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema)]),
});
export const VendorCustomersCreateManyVendorInputEnvelopeSchema = z.strictObject({
    data: z.union([z.lazy(() => VendorCustomersCreateManyVendorInputSchema), z.lazy(() => VendorCustomersCreateManyVendorInputSchema).array()]),
    skipDuplicates: z.boolean().optional(),
});
export const UserUpsertWithoutVendorInputSchema = z.strictObject({
    update: z.union([z.lazy(() => UserUpdateWithoutVendorInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVendorInputSchema)]),
    create: z.union([z.lazy(() => UserCreateWithoutVendorInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorInputSchema)]),
    where: z.lazy(() => UserWhereInputSchema).optional(),
});
export const UserUpdateToOneWithWhereWithoutVendorInputSchema = z.strictObject({
    where: z.lazy(() => UserWhereInputSchema).optional(),
    data: z.union([z.lazy(() => UserUpdateWithoutVendorInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVendorInputSchema)]),
});
export const UserUpdateWithoutVendorInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string().min(2, { message: "Name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    phone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    address: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    role: z.union([z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUpdateManyWithoutUserNestedInputSchema).optional(),
    pushToken: z.lazy(() => PushTokenUpdateManyWithoutUserNestedInputSchema).optional(),
});
export const UserUncheckedUpdateWithoutVendorInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string().min(2, { message: "Name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    phone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    address: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    role: z.union([z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
    pushToken: z.lazy(() => PushTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});
export const ProductUpsertWithWhereUniqueWithoutVendorInputSchema = z.strictObject({
    where: z.lazy(() => ProductWhereUniqueInputSchema),
    update: z.union([z.lazy(() => ProductUpdateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutVendorInputSchema)]),
    create: z.union([z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema)]),
});
export const ProductUpdateWithWhereUniqueWithoutVendorInputSchema = z.strictObject({
    where: z.lazy(() => ProductWhereUniqueInputSchema),
    data: z.union([z.lazy(() => ProductUpdateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutVendorInputSchema)]),
});
export const ProductUpdateManyWithWhereWithoutVendorInputSchema = z.strictObject({
    where: z.lazy(() => ProductScalarWhereInputSchema),
    data: z.union([z.lazy(() => ProductUpdateManyMutationInputSchema), z.lazy(() => ProductUncheckedUpdateManyWithoutVendorInputSchema)]),
});
export const ProductScalarWhereInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => ProductScalarWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    vendorId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productName: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    description: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    unit: z.union([z.lazy(() => EnumProductUnitFilterSchema), z.lazy(() => ProductUnitSchema)]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
});
export const VendorCustomersUpsertWithWhereUniqueWithoutVendorInputSchema = z.strictObject({
    where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
    update: z.union([z.lazy(() => VendorCustomersUpdateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutVendorInputSchema)]),
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutVendorInputSchema)]),
});
export const VendorCustomersUpdateWithWhereUniqueWithoutVendorInputSchema = z.strictObject({
    where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
    data: z.union([z.lazy(() => VendorCustomersUpdateWithoutVendorInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutVendorInputSchema)]),
});
export const VendorCustomersUpdateManyWithWhereWithoutVendorInputSchema = z.strictObject({
    where: z.lazy(() => VendorCustomersScalarWhereInputSchema),
    data: z.union([z.lazy(() => VendorCustomersUpdateManyMutationInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutVendorInputSchema)]),
});
export const VendorCreateWithoutProductInputSchema = z.strictObject({
    id: z.uuid().optional(),
    businessName: z.string().min(2, { message: "Business name must be at least 2 characters long" }),
    businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    user: z.lazy(() => UserCreateNestedOneWithoutVendorInputSchema),
    vendorcustomers: z.lazy(() => VendorCustomersCreateNestedManyWithoutVendorInputSchema).optional(),
});
export const VendorUncheckedCreateWithoutProductInputSchema = z.strictObject({
    id: z.uuid().optional(),
    userId: z.string(),
    businessName: z.string().min(2, { message: "Business name must be at least 2 characters long" }),
    businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
});
export const VendorCreateOrConnectWithoutProductInputSchema = z.strictObject({
    where: z.lazy(() => VendorWhereUniqueInputSchema),
    create: z.union([z.lazy(() => VendorCreateWithoutProductInputSchema), z.lazy(() => VendorUncheckedCreateWithoutProductInputSchema)]),
});
export const CustomerSubscriptionCreateWithoutProductInputSchema = z.strictObject({
    id: z.uuid().optional(),
    startDate: z.coerce.date(),
    dailyQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendorCustomers: z.lazy(() => VendorCustomersCreateNestedOneWithoutSubscriptionInputSchema),
    requests: z.lazy(() => RequestsCreateNestedManyWithoutSubscriptionInputSchema).optional(),
});
export const CustomerSubscriptionUncheckedCreateWithoutProductInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorCustomerId: z.string(),
    startDate: z.coerce.date(),
    dailyQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    requests: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutSubscriptionInputSchema).optional(),
});
export const CustomerSubscriptionCreateOrConnectWithoutProductInputSchema = z.strictObject({
    where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema)]),
});
export const CustomerSubscriptionCreateManyProductInputEnvelopeSchema = z.strictObject({
    data: z.union([z.lazy(() => CustomerSubscriptionCreateManyProductInputSchema), z.lazy(() => CustomerSubscriptionCreateManyProductInputSchema).array()]),
    skipDuplicates: z.boolean().optional(),
});
export const RequestsCreateWithoutProductInputSchema = z.strictObject({
    id: z.uuid().optional(),
    type: z.lazy(() => RequestTypeSchema).optional(),
    message: z.string().min(2, { message: "Message should be at least 2 of 2 characters" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    requestedQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    status: z.lazy(() => StatusSchema).optional(),
    respondedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendorCustomers: z.lazy(() => VendorCustomersCreateNestedOneWithoutRequestInputSchema),
    subscription: z.lazy(() => CustomerSubscriptionCreateNestedOneWithoutRequestsInputSchema),
});
export const RequestsUncheckedCreateWithoutProductInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorCustomerId: z.string(),
    subscriptionId: z.string(),
    type: z.lazy(() => RequestTypeSchema).optional(),
    message: z.string().min(2, { message: "Message should be at least 2 of 2 characters" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    requestedQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    status: z.lazy(() => StatusSchema).optional(),
    respondedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const RequestsCreateOrConnectWithoutProductInputSchema = z.strictObject({
    where: z.lazy(() => RequestsWhereUniqueInputSchema),
    create: z.union([z.lazy(() => RequestsCreateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema)]),
});
export const RequestsCreateManyProductInputEnvelopeSchema = z.strictObject({
    data: z.union([z.lazy(() => RequestsCreateManyProductInputSchema), z.lazy(() => RequestsCreateManyProductInputSchema).array()]),
    skipDuplicates: z.boolean().optional(),
});
export const VendorUpsertWithoutProductInputSchema = z.strictObject({
    update: z.union([z.lazy(() => VendorUpdateWithoutProductInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutProductInputSchema)]),
    create: z.union([z.lazy(() => VendorCreateWithoutProductInputSchema), z.lazy(() => VendorUncheckedCreateWithoutProductInputSchema)]),
    where: z.lazy(() => VendorWhereInputSchema).optional(),
});
export const VendorUpdateToOneWithWhereWithoutProductInputSchema = z.strictObject({
    where: z.lazy(() => VendorWhereInputSchema).optional(),
    data: z.union([z.lazy(() => VendorUpdateWithoutProductInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutProductInputSchema)]),
});
export const VendorUpdateWithoutProductInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessName: z.union([z.string().min(2, { message: "Business name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessPhone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutVendorNestedInputSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUpdateManyWithoutVendorNestedInputSchema).optional(),
});
export const VendorUncheckedUpdateWithoutProductInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessName: z.union([z.string().min(2, { message: "Business name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessPhone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
});
export const CustomerSubscriptionUpsertWithWhereUniqueWithoutProductInputSchema = z.strictObject({
    where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
    update: z.union([z.lazy(() => CustomerSubscriptionUpdateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutProductInputSchema)]),
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutProductInputSchema)]),
});
export const CustomerSubscriptionUpdateWithWhereUniqueWithoutProductInputSchema = z.strictObject({
    where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
    data: z.union([z.lazy(() => CustomerSubscriptionUpdateWithoutProductInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutProductInputSchema)]),
});
export const CustomerSubscriptionUpdateManyWithWhereWithoutProductInputSchema = z.strictObject({
    where: z.lazy(() => CustomerSubscriptionScalarWhereInputSchema),
    data: z.union([z.lazy(() => CustomerSubscriptionUpdateManyMutationInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutProductInputSchema)]),
});
export const CustomerSubscriptionScalarWhereInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => CustomerSubscriptionScalarWhereInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => CustomerSubscriptionScalarWhereInputSchema), z.lazy(() => CustomerSubscriptionScalarWhereInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    vendorCustomerId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    startDate: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    dailyQuantity: z.union([z.lazy(() => DecimalFilterSchema), z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
});
export const RequestsUpsertWithWhereUniqueWithoutProductInputSchema = z.strictObject({
    where: z.lazy(() => RequestsWhereUniqueInputSchema),
    update: z.union([z.lazy(() => RequestsUpdateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedUpdateWithoutProductInputSchema)]),
    create: z.union([z.lazy(() => RequestsCreateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutProductInputSchema)]),
});
export const RequestsUpdateWithWhereUniqueWithoutProductInputSchema = z.strictObject({
    where: z.lazy(() => RequestsWhereUniqueInputSchema),
    data: z.union([z.lazy(() => RequestsUpdateWithoutProductInputSchema), z.lazy(() => RequestsUncheckedUpdateWithoutProductInputSchema)]),
});
export const RequestsUpdateManyWithWhereWithoutProductInputSchema = z.strictObject({
    where: z.lazy(() => RequestsScalarWhereInputSchema),
    data: z.union([z.lazy(() => RequestsUpdateManyMutationInputSchema), z.lazy(() => RequestsUncheckedUpdateManyWithoutProductInputSchema)]),
});
export const RequestsScalarWhereInputSchema = z.strictObject({
    AND: z.union([z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array()]).optional(),
    OR: z.lazy(() => RequestsScalarWhereInputSchema).array().optional(),
    NOT: z.union([z.lazy(() => RequestsScalarWhereInputSchema), z.lazy(() => RequestsScalarWhereInputSchema).array()]).optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    vendorCustomerId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    subscriptionId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    type: z.union([z.lazy(() => EnumRequestTypeFilterSchema), z.lazy(() => RequestTypeSchema)]).optional(),
    message: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    start_date: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    end_date: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    requestedQuantity: z.union([z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })]).optional().nullable(),
    status: z.union([z.lazy(() => EnumStatusFilterSchema), z.lazy(() => StatusSchema)]).optional(),
    respondedAt: z.union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()]).optional().nullable(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
});
export const VendorCreateWithoutVendorcustomersInputSchema = z.strictObject({
    id: z.uuid().optional(),
    businessName: z.string().min(2, { message: "Business name must be at least 2 characters long" }),
    businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    user: z.lazy(() => UserCreateNestedOneWithoutVendorInputSchema),
    product: z.lazy(() => ProductCreateNestedManyWithoutVendorInputSchema).optional(),
});
export const VendorUncheckedCreateWithoutVendorcustomersInputSchema = z.strictObject({
    id: z.uuid().optional(),
    userId: z.string(),
    businessName: z.string().min(2, { message: "Business name must be at least 2 characters long" }),
    businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    product: z.lazy(() => ProductUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
});
export const VendorCreateOrConnectWithoutVendorcustomersInputSchema = z.strictObject({
    where: z.lazy(() => VendorWhereUniqueInputSchema),
    create: z.union([z.lazy(() => VendorCreateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedCreateWithoutVendorcustomersInputSchema)]),
});
export const UserCreateWithoutVendorcustomersInputSchema = z.strictObject({
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
export const UserUncheckedCreateWithoutVendorcustomersInputSchema = z.strictObject({
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
export const UserCreateOrConnectWithoutVendorcustomersInputSchema = z.strictObject({
    where: z.lazy(() => UserWhereUniqueInputSchema),
    create: z.union([z.lazy(() => UserCreateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorcustomersInputSchema)]),
});
export const CustomerSubscriptionCreateWithoutVendorCustomersInputSchema = z.strictObject({
    id: z.uuid().optional(),
    startDate: z.coerce.date(),
    dailyQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    product: z.lazy(() => ProductCreateNestedOneWithoutSubscriptionInputSchema),
    requests: z.lazy(() => RequestsCreateNestedManyWithoutSubscriptionInputSchema).optional(),
});
export const CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema = z.strictObject({
    id: z.uuid().optional(),
    productId: z.string(),
    startDate: z.coerce.date(),
    dailyQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    requests: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutSubscriptionInputSchema).optional(),
});
export const CustomerSubscriptionCreateOrConnectWithoutVendorCustomersInputSchema = z.strictObject({
    where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema)]),
});
export const CustomerSubscriptionCreateManyVendorCustomersInputEnvelopeSchema = z.strictObject({
    data: z.union([z.lazy(() => CustomerSubscriptionCreateManyVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionCreateManyVendorCustomersInputSchema).array()]),
    skipDuplicates: z.boolean().optional(),
});
export const RequestsCreateWithoutVendorCustomersInputSchema = z.strictObject({
    id: z.uuid().optional(),
    type: z.lazy(() => RequestTypeSchema).optional(),
    message: z.string().min(2, { message: "Message should be at least 2 of 2 characters" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    requestedQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    status: z.lazy(() => StatusSchema).optional(),
    respondedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    product: z.lazy(() => ProductCreateNestedOneWithoutRequestInputSchema),
    subscription: z.lazy(() => CustomerSubscriptionCreateNestedOneWithoutRequestsInputSchema),
});
export const RequestsUncheckedCreateWithoutVendorCustomersInputSchema = z.strictObject({
    id: z.uuid().optional(),
    productId: z.string(),
    subscriptionId: z.string(),
    type: z.lazy(() => RequestTypeSchema).optional(),
    message: z.string().min(2, { message: "Message should be at least 2 of 2 characters" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    requestedQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    status: z.lazy(() => StatusSchema).optional(),
    respondedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const RequestsCreateOrConnectWithoutVendorCustomersInputSchema = z.strictObject({
    where: z.lazy(() => RequestsWhereUniqueInputSchema),
    create: z.union([z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema)]),
});
export const RequestsCreateManyVendorCustomersInputEnvelopeSchema = z.strictObject({
    data: z.union([z.lazy(() => RequestsCreateManyVendorCustomersInputSchema), z.lazy(() => RequestsCreateManyVendorCustomersInputSchema).array()]),
    skipDuplicates: z.boolean().optional(),
});
export const VendorUpsertWithoutVendorcustomersInputSchema = z.strictObject({
    update: z.union([z.lazy(() => VendorUpdateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutVendorcustomersInputSchema)]),
    create: z.union([z.lazy(() => VendorCreateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedCreateWithoutVendorcustomersInputSchema)]),
    where: z.lazy(() => VendorWhereInputSchema).optional(),
});
export const VendorUpdateToOneWithWhereWithoutVendorcustomersInputSchema = z.strictObject({
    where: z.lazy(() => VendorWhereInputSchema).optional(),
    data: z.union([z.lazy(() => VendorUpdateWithoutVendorcustomersInputSchema), z.lazy(() => VendorUncheckedUpdateWithoutVendorcustomersInputSchema)]),
});
export const VendorUpdateWithoutVendorcustomersInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessName: z.union([z.string().min(2, { message: "Business name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessPhone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutVendorNestedInputSchema).optional(),
    product: z.lazy(() => ProductUpdateManyWithoutVendorNestedInputSchema).optional(),
});
export const VendorUncheckedUpdateWithoutVendorcustomersInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessName: z.union([z.string().min(2, { message: "Business name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    businessPhone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    product: z.lazy(() => ProductUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
});
export const UserUpsertWithoutVendorcustomersInputSchema = z.strictObject({
    update: z.union([z.lazy(() => UserUpdateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVendorcustomersInputSchema)]),
    create: z.union([z.lazy(() => UserCreateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedCreateWithoutVendorcustomersInputSchema)]),
    where: z.lazy(() => UserWhereInputSchema).optional(),
});
export const UserUpdateToOneWithWhereWithoutVendorcustomersInputSchema = z.strictObject({
    where: z.lazy(() => UserWhereInputSchema).optional(),
    data: z.union([z.lazy(() => UserUpdateWithoutVendorcustomersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVendorcustomersInputSchema)]),
});
export const UserUpdateWithoutVendorcustomersInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string().min(2, { message: "Name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    phone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    address: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    role: z.union([z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendor: z.lazy(() => VendorUpdateOneWithoutUserNestedInputSchema).optional(),
    pushToken: z.lazy(() => PushTokenUpdateManyWithoutUserNestedInputSchema).optional(),
});
export const UserUncheckedUpdateWithoutVendorcustomersInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string().min(2, { message: "Name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    phone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    address: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    role: z.union([z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendor: z.lazy(() => VendorUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
    pushToken: z.lazy(() => PushTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});
export const CustomerSubscriptionUpsertWithWhereUniqueWithoutVendorCustomersInputSchema = z.strictObject({
    where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
    update: z.union([z.lazy(() => CustomerSubscriptionUpdateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutVendorCustomersInputSchema)]),
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutVendorCustomersInputSchema)]),
});
export const CustomerSubscriptionUpdateWithWhereUniqueWithoutVendorCustomersInputSchema = z.strictObject({
    where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
    data: z.union([z.lazy(() => CustomerSubscriptionUpdateWithoutVendorCustomersInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutVendorCustomersInputSchema)]),
});
export const CustomerSubscriptionUpdateManyWithWhereWithoutVendorCustomersInputSchema = z.strictObject({
    where: z.lazy(() => CustomerSubscriptionScalarWhereInputSchema),
    data: z.union([z.lazy(() => CustomerSubscriptionUpdateManyMutationInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersInputSchema)]),
});
export const RequestsUpsertWithWhereUniqueWithoutVendorCustomersInputSchema = z.strictObject({
    where: z.lazy(() => RequestsWhereUniqueInputSchema),
    update: z.union([z.lazy(() => RequestsUpdateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedUpdateWithoutVendorCustomersInputSchema)]),
    create: z.union([z.lazy(() => RequestsCreateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutVendorCustomersInputSchema)]),
});
export const RequestsUpdateWithWhereUniqueWithoutVendorCustomersInputSchema = z.strictObject({
    where: z.lazy(() => RequestsWhereUniqueInputSchema),
    data: z.union([z.lazy(() => RequestsUpdateWithoutVendorCustomersInputSchema), z.lazy(() => RequestsUncheckedUpdateWithoutVendorCustomersInputSchema)]),
});
export const RequestsUpdateManyWithWhereWithoutVendorCustomersInputSchema = z.strictObject({
    where: z.lazy(() => RequestsScalarWhereInputSchema),
    data: z.union([z.lazy(() => RequestsUpdateManyMutationInputSchema), z.lazy(() => RequestsUncheckedUpdateManyWithoutVendorCustomersInputSchema)]),
});
export const VendorCustomersCreateWithoutSubscriptionInputSchema = z.strictObject({
    id: z.uuid().optional(),
    customerPhone: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendor: z.lazy(() => VendorCreateNestedOneWithoutVendorcustomersInputSchema),
    user: z.lazy(() => UserCreateNestedOneWithoutVendorcustomersInputSchema),
    request: z.lazy(() => RequestsCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});
export const VendorCustomersUncheckedCreateWithoutSubscriptionInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorId: z.string(),
    customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    customerPhone: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});
export const VendorCustomersCreateOrConnectWithoutSubscriptionInputSchema = z.strictObject({
    where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutSubscriptionInputSchema)]),
});
export const ProductCreateWithoutSubscriptionInputSchema = z.strictObject({
    id: z.uuid().optional(),
    productName: z.string().min(2, { message: "Product name must be of at least 2 characters" }),
    description: z.string().min(2, { message: "Product description must be of at leat 2 characters" }),
    unit: z.lazy(() => ProductUnitSchema),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendor: z.lazy(() => VendorCreateNestedOneWithoutProductInputSchema),
    request: z.lazy(() => RequestsCreateNestedManyWithoutProductInputSchema).optional(),
});
export const ProductUncheckedCreateWithoutSubscriptionInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorId: z.string(),
    productName: z.string().min(2, { message: "Product name must be of at least 2 characters" }),
    description: z.string().min(2, { message: "Product description must be of at leat 2 characters" }),
    unit: z.lazy(() => ProductUnitSchema),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    request: z.lazy(() => RequestsUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});
export const ProductCreateOrConnectWithoutSubscriptionInputSchema = z.strictObject({
    where: z.lazy(() => ProductWhereUniqueInputSchema),
    create: z.union([z.lazy(() => ProductCreateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSubscriptionInputSchema)]),
});
export const RequestsCreateWithoutSubscriptionInputSchema = z.strictObject({
    id: z.uuid().optional(),
    type: z.lazy(() => RequestTypeSchema).optional(),
    message: z.string().min(2, { message: "Message should be at least 2 of 2 characters" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    requestedQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    status: z.lazy(() => StatusSchema).optional(),
    respondedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendorCustomers: z.lazy(() => VendorCustomersCreateNestedOneWithoutRequestInputSchema),
    product: z.lazy(() => ProductCreateNestedOneWithoutRequestInputSchema),
});
export const RequestsUncheckedCreateWithoutSubscriptionInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorCustomerId: z.string(),
    productId: z.string(),
    type: z.lazy(() => RequestTypeSchema).optional(),
    message: z.string().min(2, { message: "Message should be at least 2 of 2 characters" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    requestedQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    status: z.lazy(() => StatusSchema).optional(),
    respondedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const RequestsCreateOrConnectWithoutSubscriptionInputSchema = z.strictObject({
    where: z.lazy(() => RequestsWhereUniqueInputSchema),
    create: z.union([z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema)]),
});
export const RequestsCreateManySubscriptionInputEnvelopeSchema = z.strictObject({
    data: z.union([z.lazy(() => RequestsCreateManySubscriptionInputSchema), z.lazy(() => RequestsCreateManySubscriptionInputSchema).array()]),
    skipDuplicates: z.boolean().optional(),
});
export const VendorCustomersUpsertWithoutSubscriptionInputSchema = z.strictObject({
    update: z.union([z.lazy(() => VendorCustomersUpdateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutSubscriptionInputSchema)]),
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutSubscriptionInputSchema)]),
    where: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
});
export const VendorCustomersUpdateToOneWithWhereWithoutSubscriptionInputSchema = z.strictObject({
    where: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
    data: z.union([z.lazy(() => VendorCustomersUpdateWithoutSubscriptionInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutSubscriptionInputSchema)]),
});
export const VendorCustomersUpdateWithoutSubscriptionInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendor: z.lazy(() => VendorUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
    request: z.lazy(() => RequestsUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});
export const VendorCustomersUncheckedUpdateWithoutSubscriptionInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerId: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    request: z.lazy(() => RequestsUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});
export const ProductUpsertWithoutSubscriptionInputSchema = z.strictObject({
    update: z.union([z.lazy(() => ProductUpdateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutSubscriptionInputSchema)]),
    create: z.union([z.lazy(() => ProductCreateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSubscriptionInputSchema)]),
    where: z.lazy(() => ProductWhereInputSchema).optional(),
});
export const ProductUpdateToOneWithWhereWithoutSubscriptionInputSchema = z.strictObject({
    where: z.lazy(() => ProductWhereInputSchema).optional(),
    data: z.union([z.lazy(() => ProductUpdateWithoutSubscriptionInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutSubscriptionInputSchema)]),
});
export const ProductUpdateWithoutSubscriptionInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productName: z.union([z.string().min(2, { message: "Product name must be of at least 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z.union([z.string().min(2, { message: "Product description must be of at leat 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    unit: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendor: z.lazy(() => VendorUpdateOneRequiredWithoutProductNestedInputSchema).optional(),
    request: z.lazy(() => RequestsUpdateManyWithoutProductNestedInputSchema).optional(),
});
export const ProductUncheckedUpdateWithoutSubscriptionInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productName: z.union([z.string().min(2, { message: "Product name must be of at least 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z.union([z.string().min(2, { message: "Product description must be of at leat 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    unit: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    request: z.lazy(() => RequestsUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});
export const RequestsUpsertWithWhereUniqueWithoutSubscriptionInputSchema = z.strictObject({
    where: z.lazy(() => RequestsWhereUniqueInputSchema),
    update: z.union([z.lazy(() => RequestsUpdateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedUpdateWithoutSubscriptionInputSchema)]),
    create: z.union([z.lazy(() => RequestsCreateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedCreateWithoutSubscriptionInputSchema)]),
});
export const RequestsUpdateWithWhereUniqueWithoutSubscriptionInputSchema = z.strictObject({
    where: z.lazy(() => RequestsWhereUniqueInputSchema),
    data: z.union([z.lazy(() => RequestsUpdateWithoutSubscriptionInputSchema), z.lazy(() => RequestsUncheckedUpdateWithoutSubscriptionInputSchema)]),
});
export const RequestsUpdateManyWithWhereWithoutSubscriptionInputSchema = z.strictObject({
    where: z.lazy(() => RequestsScalarWhereInputSchema),
    data: z.union([z.lazy(() => RequestsUpdateManyMutationInputSchema), z.lazy(() => RequestsUncheckedUpdateManyWithoutSubscriptionInputSchema)]),
});
export const VendorCustomersCreateWithoutRequestInputSchema = z.strictObject({
    id: z.uuid().optional(),
    customerPhone: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendor: z.lazy(() => VendorCreateNestedOneWithoutVendorcustomersInputSchema),
    user: z.lazy(() => UserCreateNestedOneWithoutVendorcustomersInputSchema),
    subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});
export const VendorCustomersUncheckedCreateWithoutRequestInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorId: z.string(),
    customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    customerPhone: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutVendorCustomersInputSchema).optional(),
});
export const VendorCustomersCreateOrConnectWithoutRequestInputSchema = z.strictObject({
    where: z.lazy(() => VendorCustomersWhereUniqueInputSchema),
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutRequestInputSchema)]),
});
export const ProductCreateWithoutRequestInputSchema = z.strictObject({
    id: z.uuid().optional(),
    productName: z.string().min(2, { message: "Product name must be of at least 2 characters" }),
    description: z.string().min(2, { message: "Product description must be of at leat 2 characters" }),
    unit: z.lazy(() => ProductUnitSchema),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendor: z.lazy(() => VendorCreateNestedOneWithoutProductInputSchema),
    subscription: z.lazy(() => CustomerSubscriptionCreateNestedManyWithoutProductInputSchema).optional(),
});
export const ProductUncheckedCreateWithoutRequestInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorId: z.string(),
    productName: z.string().min(2, { message: "Product name must be of at least 2 characters" }),
    description: z.string().min(2, { message: "Product description must be of at leat 2 characters" }),
    unit: z.lazy(() => ProductUnitSchema),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});
export const ProductCreateOrConnectWithoutRequestInputSchema = z.strictObject({
    where: z.lazy(() => ProductWhereUniqueInputSchema),
    create: z.union([z.lazy(() => ProductCreateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedCreateWithoutRequestInputSchema)]),
});
export const CustomerSubscriptionCreateWithoutRequestsInputSchema = z.strictObject({
    id: z.uuid().optional(),
    startDate: z.coerce.date(),
    dailyQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    vendorCustomers: z.lazy(() => VendorCustomersCreateNestedOneWithoutSubscriptionInputSchema),
    product: z.lazy(() => ProductCreateNestedOneWithoutSubscriptionInputSchema),
});
export const CustomerSubscriptionUncheckedCreateWithoutRequestsInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorCustomerId: z.string(),
    productId: z.string(),
    startDate: z.coerce.date(),
    dailyQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const CustomerSubscriptionCreateOrConnectWithoutRequestsInputSchema = z.strictObject({
    where: z.lazy(() => CustomerSubscriptionWhereUniqueInputSchema),
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutRequestsInputSchema)]),
});
export const VendorCustomersUpsertWithoutRequestInputSchema = z.strictObject({
    update: z.union([z.lazy(() => VendorCustomersUpdateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutRequestInputSchema)]),
    create: z.union([z.lazy(() => VendorCustomersCreateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedCreateWithoutRequestInputSchema)]),
    where: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
});
export const VendorCustomersUpdateToOneWithWhereWithoutRequestInputSchema = z.strictObject({
    where: z.lazy(() => VendorCustomersWhereInputSchema).optional(),
    data: z.union([z.lazy(() => VendorCustomersUpdateWithoutRequestInputSchema), z.lazy(() => VendorCustomersUncheckedUpdateWithoutRequestInputSchema)]),
});
export const VendorCustomersUpdateWithoutRequestInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendor: z.lazy(() => VendorUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});
export const VendorCustomersUncheckedUpdateWithoutRequestInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerId: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});
export const ProductUpsertWithoutRequestInputSchema = z.strictObject({
    update: z.union([z.lazy(() => ProductUpdateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutRequestInputSchema)]),
    create: z.union([z.lazy(() => ProductCreateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedCreateWithoutRequestInputSchema)]),
    where: z.lazy(() => ProductWhereInputSchema).optional(),
});
export const ProductUpdateToOneWithWhereWithoutRequestInputSchema = z.strictObject({
    where: z.lazy(() => ProductWhereInputSchema).optional(),
    data: z.union([z.lazy(() => ProductUpdateWithoutRequestInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutRequestInputSchema)]),
});
export const ProductUpdateWithoutRequestInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productName: z.union([z.string().min(2, { message: "Product name must be of at least 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z.union([z.string().min(2, { message: "Product description must be of at leat 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    unit: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendor: z.lazy(() => VendorUpdateOneRequiredWithoutProductNestedInputSchema).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutProductNestedInputSchema).optional(),
});
export const ProductUncheckedUpdateWithoutRequestInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productName: z.union([z.string().min(2, { message: "Product name must be of at least 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z.union([z.string().min(2, { message: "Product description must be of at leat 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    unit: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});
export const CustomerSubscriptionUpsertWithoutRequestsInputSchema = z.strictObject({
    update: z.union([z.lazy(() => CustomerSubscriptionUpdateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutRequestsInputSchema)]),
    create: z.union([z.lazy(() => CustomerSubscriptionCreateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedCreateWithoutRequestsInputSchema)]),
    where: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
});
export const CustomerSubscriptionUpdateToOneWithWhereWithoutRequestsInputSchema = z.strictObject({
    where: z.lazy(() => CustomerSubscriptionWhereInputSchema).optional(),
    data: z.union([z.lazy(() => CustomerSubscriptionUpdateWithoutRequestsInputSchema), z.lazy(() => CustomerSubscriptionUncheckedUpdateWithoutRequestsInputSchema)]),
});
export const CustomerSubscriptionUpdateWithoutRequestsInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    startDate: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    dailyQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => DecimalFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomers: z.lazy(() => VendorCustomersUpdateOneRequiredWithoutSubscriptionNestedInputSchema).optional(),
    product: z.lazy(() => ProductUpdateOneRequiredWithoutSubscriptionNestedInputSchema).optional(),
});
export const CustomerSubscriptionUncheckedUpdateWithoutRequestsInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomerId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    startDate: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    dailyQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => DecimalFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const UserCreateWithoutPushTokenInputSchema = z.strictObject({
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
export const UserUncheckedCreateWithoutPushTokenInputSchema = z.strictObject({
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
export const UserCreateOrConnectWithoutPushTokenInputSchema = z.strictObject({
    where: z.lazy(() => UserWhereUniqueInputSchema),
    create: z.union([z.lazy(() => UserCreateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedCreateWithoutPushTokenInputSchema)]),
});
export const UserUpsertWithoutPushTokenInputSchema = z.strictObject({
    update: z.union([z.lazy(() => UserUpdateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedUpdateWithoutPushTokenInputSchema)]),
    create: z.union([z.lazy(() => UserCreateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedCreateWithoutPushTokenInputSchema)]),
    where: z.lazy(() => UserWhereInputSchema).optional(),
});
export const UserUpdateToOneWithWhereWithoutPushTokenInputSchema = z.strictObject({
    where: z.lazy(() => UserWhereInputSchema).optional(),
    data: z.union([z.lazy(() => UserUpdateWithoutPushTokenInputSchema), z.lazy(() => UserUncheckedUpdateWithoutPushTokenInputSchema)]),
});
export const UserUpdateWithoutPushTokenInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string().min(2, { message: "Name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    phone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    address: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    role: z.union([z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendor: z.lazy(() => VendorUpdateOneWithoutUserNestedInputSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUpdateManyWithoutUserNestedInputSchema).optional(),
});
export const UserUncheckedUpdateWithoutPushTokenInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string().min(2, { message: "Name must be at least 2 characters long" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    phone: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    address: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    role: z.union([z.lazy(() => RoleSchema), z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendor: z.lazy(() => VendorUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
    vendorcustomers: z.lazy(() => VendorCustomersUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});
export const VendorCustomersCreateManyUserInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorId: z.string(),
    customerPhone: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const PushTokenCreateManyUserInputSchema = z.strictObject({
    id: z.cuid().optional(),
    token: z.string(),
    platform: z.lazy(() => PlatformSchema),
    createdAt: z.coerce.date().optional(),
});
export const VendorCustomersUpdateWithoutUserInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendor: z.lazy(() => VendorUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
    request: z.lazy(() => RequestsUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});
export const VendorCustomersUncheckedUpdateWithoutUserInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
    request: z.lazy(() => RequestsUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});
export const VendorCustomersUncheckedUpdateManyWithoutUserInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const PushTokenUpdateWithoutUserInputSchema = z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    token: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    platform: z.union([z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const PushTokenUncheckedUpdateWithoutUserInputSchema = z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    token: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    platform: z.union([z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const PushTokenUncheckedUpdateManyWithoutUserInputSchema = z.strictObject({
    id: z.union([z.cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    token: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    platform: z.union([z.lazy(() => PlatformSchema), z.lazy(() => EnumPlatformFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const ProductCreateManyVendorInputSchema = z.strictObject({
    id: z.uuid().optional(),
    productName: z.string().min(2, { message: "Product name must be of at least 2 characters" }),
    description: z.string().min(2, { message: "Product description must be of at leat 2 characters" }),
    unit: z.lazy(() => ProductUnitSchema),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const VendorCustomersCreateManyVendorInputSchema = z.strictObject({
    id: z.uuid().optional(),
    customerId: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    customerPhone: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const ProductUpdateWithoutVendorInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productName: z.union([z.string().min(2, { message: "Product name must be of at least 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z.union([z.string().min(2, { message: "Product description must be of at leat 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    unit: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutProductNestedInputSchema).optional(),
    request: z.lazy(() => RequestsUpdateManyWithoutProductNestedInputSchema).optional(),
});
export const ProductUncheckedUpdateWithoutVendorInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productName: z.union([z.string().min(2, { message: "Product name must be of at least 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z.union([z.string().min(2, { message: "Product description must be of at leat 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    unit: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
    request: z.lazy(() => RequestsUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});
export const ProductUncheckedUpdateManyWithoutVendorInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productName: z.union([z.string().min(2, { message: "Product name must be of at least 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z.union([z.string().min(2, { message: "Product description must be of at leat 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    unit: z.union([z.lazy(() => ProductUnitSchema), z.lazy(() => EnumProductUnitFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const VendorCustomersUpdateWithoutVendorInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutVendorcustomersNestedInputSchema).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
    request: z.lazy(() => RequestsUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});
export const VendorCustomersUncheckedUpdateWithoutVendorInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerId: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
    request: z.lazy(() => RequestsUncheckedUpdateManyWithoutVendorCustomersNestedInputSchema).optional(),
});
export const VendorCustomersUncheckedUpdateManyWithoutVendorInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerId: z.union([z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    customerPhone: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const CustomerSubscriptionCreateManyProductInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorCustomerId: z.string(),
    startDate: z.coerce.date(),
    dailyQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const RequestsCreateManyProductInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorCustomerId: z.string(),
    subscriptionId: z.string(),
    type: z.lazy(() => RequestTypeSchema).optional(),
    message: z.string().min(2, { message: "Message should be at least 2 of 2 characters" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    requestedQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    status: z.lazy(() => StatusSchema).optional(),
    respondedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const CustomerSubscriptionUpdateWithoutProductInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    startDate: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    dailyQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => DecimalFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomers: z.lazy(() => VendorCustomersUpdateOneRequiredWithoutSubscriptionNestedInputSchema).optional(),
    requests: z.lazy(() => RequestsUpdateManyWithoutSubscriptionNestedInputSchema).optional(),
});
export const CustomerSubscriptionUncheckedUpdateWithoutProductInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomerId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    startDate: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    dailyQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => DecimalFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requests: z.lazy(() => RequestsUncheckedUpdateManyWithoutSubscriptionNestedInputSchema).optional(),
});
export const CustomerSubscriptionUncheckedUpdateManyWithoutProductInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomerId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    startDate: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    dailyQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => DecimalFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const RequestsUpdateWithoutProductInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema)]).optional(),
    message: z.union([z.string().min(2, { message: "Message should be at least 2 of 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    start_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    end_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requestedQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema)]).optional().nullable(),
    status: z.union([z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema)]).optional(),
    respondedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)]).optional().nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomers: z.lazy(() => VendorCustomersUpdateOneRequiredWithoutRequestNestedInputSchema).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUpdateOneRequiredWithoutRequestsNestedInputSchema).optional(),
});
export const RequestsUncheckedUpdateWithoutProductInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomerId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    subscriptionId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema)]).optional(),
    message: z.union([z.string().min(2, { message: "Message should be at least 2 of 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    start_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    end_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requestedQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema)]).optional().nullable(),
    status: z.union([z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema)]).optional(),
    respondedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)]).optional().nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const RequestsUncheckedUpdateManyWithoutProductInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomerId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    subscriptionId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema)]).optional(),
    message: z.union([z.string().min(2, { message: "Message should be at least 2 of 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    start_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    end_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requestedQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema)]).optional().nullable(),
    status: z.union([z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema)]).optional(),
    respondedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)]).optional().nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const CustomerSubscriptionCreateManyVendorCustomersInputSchema = z.strictObject({
    id: z.uuid().optional(),
    productId: z.string(),
    startDate: z.coerce.date(),
    dailyQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const RequestsCreateManyVendorCustomersInputSchema = z.strictObject({
    id: z.uuid().optional(),
    productId: z.string(),
    subscriptionId: z.string(),
    type: z.lazy(() => RequestTypeSchema).optional(),
    message: z.string().min(2, { message: "Message should be at least 2 of 2 characters" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    requestedQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    status: z.lazy(() => StatusSchema).optional(),
    respondedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const CustomerSubscriptionUpdateWithoutVendorCustomersInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    startDate: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    dailyQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => DecimalFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    product: z.lazy(() => ProductUpdateOneRequiredWithoutSubscriptionNestedInputSchema).optional(),
    requests: z.lazy(() => RequestsUpdateManyWithoutSubscriptionNestedInputSchema).optional(),
});
export const CustomerSubscriptionUncheckedUpdateWithoutVendorCustomersInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    startDate: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    dailyQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => DecimalFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requests: z.lazy(() => RequestsUncheckedUpdateManyWithoutSubscriptionNestedInputSchema).optional(),
});
export const CustomerSubscriptionUncheckedUpdateManyWithoutVendorCustomersInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    startDate: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    dailyQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => DecimalFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const RequestsUpdateWithoutVendorCustomersInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema)]).optional(),
    message: z.union([z.string().min(2, { message: "Message should be at least 2 of 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    start_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    end_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requestedQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema)]).optional().nullable(),
    status: z.union([z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema)]).optional(),
    respondedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)]).optional().nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    product: z.lazy(() => ProductUpdateOneRequiredWithoutRequestNestedInputSchema).optional(),
    subscription: z.lazy(() => CustomerSubscriptionUpdateOneRequiredWithoutRequestsNestedInputSchema).optional(),
});
export const RequestsUncheckedUpdateWithoutVendorCustomersInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    subscriptionId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema)]).optional(),
    message: z.union([z.string().min(2, { message: "Message should be at least 2 of 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    start_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    end_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requestedQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema)]).optional().nullable(),
    status: z.union([z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema)]).optional(),
    respondedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)]).optional().nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const RequestsUncheckedUpdateManyWithoutVendorCustomersInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    subscriptionId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema)]).optional(),
    message: z.union([z.string().min(2, { message: "Message should be at least 2 of 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    start_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    end_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requestedQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema)]).optional().nullable(),
    status: z.union([z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema)]).optional(),
    respondedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)]).optional().nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const RequestsCreateManySubscriptionInputSchema = z.strictObject({
    id: z.uuid().optional(),
    vendorCustomerId: z.string(),
    productId: z.string(),
    type: z.lazy(() => RequestTypeSchema).optional(),
    message: z.string().min(2, { message: "Message should be at least 2 of 2 characters" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    requestedQuantity: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
    status: z.lazy(() => StatusSchema).optional(),
    respondedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
});
export const RequestsUpdateWithoutSubscriptionInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema)]).optional(),
    message: z.union([z.string().min(2, { message: "Message should be at least 2 of 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    start_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    end_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requestedQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema)]).optional().nullable(),
    status: z.union([z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema)]).optional(),
    respondedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)]).optional().nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomers: z.lazy(() => VendorCustomersUpdateOneRequiredWithoutRequestNestedInputSchema).optional(),
    product: z.lazy(() => ProductUpdateOneRequiredWithoutRequestNestedInputSchema).optional(),
});
export const RequestsUncheckedUpdateWithoutSubscriptionInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomerId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema)]).optional(),
    message: z.union([z.string().min(2, { message: "Message should be at least 2 of 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    start_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    end_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requestedQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema)]).optional().nullable(),
    status: z.union([z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema)]).optional(),
    respondedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)]).optional().nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const RequestsUncheckedUpdateManyWithoutSubscriptionInputSchema = z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorCustomerId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z.union([z.lazy(() => RequestTypeSchema), z.lazy(() => EnumRequestTypeFieldUpdateOperationsInputSchema)]).optional(),
    message: z.union([z.string().min(2, { message: "Message should be at least 2 of 2 characters" }), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    start_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    end_date: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    requestedQuantity: z.union([z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal), DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }), z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema)]).optional().nullable(),
    status: z.union([z.lazy(() => StatusSchema), z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema)]).optional(),
    respondedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)]).optional().nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});
export const UserFindFirstArgsSchema = z.object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereInputSchema.optional(),
    orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
    cursor: UserWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const UserFindFirstOrThrowArgsSchema = z.object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereInputSchema.optional(),
    orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
    cursor: UserWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const UserFindManyArgsSchema = z.object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereInputSchema.optional(),
    orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
    cursor: UserWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const UserAggregateArgsSchema = z.object({
    where: UserWhereInputSchema.optional(),
    orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
    cursor: UserWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const UserGroupByArgsSchema = z.object({
    where: UserWhereInputSchema.optional(),
    orderBy: z.union([UserOrderByWithAggregationInputSchema.array(), UserOrderByWithAggregationInputSchema]).optional(),
    by: UserScalarFieldEnumSchema.array(),
    having: UserScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const UserFindUniqueArgsSchema = z.object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereUniqueInputSchema,
}).strict();
export const UserFindUniqueOrThrowArgsSchema = z.object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereUniqueInputSchema,
}).strict();
export const VendorFindFirstArgsSchema = z.object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereInputSchema.optional(),
    orderBy: z.union([VendorOrderByWithRelationInputSchema.array(), VendorOrderByWithRelationInputSchema]).optional(),
    cursor: VendorWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([VendorScalarFieldEnumSchema, VendorScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const VendorFindFirstOrThrowArgsSchema = z.object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereInputSchema.optional(),
    orderBy: z.union([VendorOrderByWithRelationInputSchema.array(), VendorOrderByWithRelationInputSchema]).optional(),
    cursor: VendorWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([VendorScalarFieldEnumSchema, VendorScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const VendorFindManyArgsSchema = z.object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereInputSchema.optional(),
    orderBy: z.union([VendorOrderByWithRelationInputSchema.array(), VendorOrderByWithRelationInputSchema]).optional(),
    cursor: VendorWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([VendorScalarFieldEnumSchema, VendorScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const VendorAggregateArgsSchema = z.object({
    where: VendorWhereInputSchema.optional(),
    orderBy: z.union([VendorOrderByWithRelationInputSchema.array(), VendorOrderByWithRelationInputSchema]).optional(),
    cursor: VendorWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const VendorGroupByArgsSchema = z.object({
    where: VendorWhereInputSchema.optional(),
    orderBy: z.union([VendorOrderByWithAggregationInputSchema.array(), VendorOrderByWithAggregationInputSchema]).optional(),
    by: VendorScalarFieldEnumSchema.array(),
    having: VendorScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const VendorFindUniqueArgsSchema = z.object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereUniqueInputSchema,
}).strict();
export const VendorFindUniqueOrThrowArgsSchema = z.object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereUniqueInputSchema,
}).strict();
export const ProductFindFirstArgsSchema = z.object({
    select: ProductSelectSchema.optional(),
    include: ProductIncludeSchema.optional(),
    where: ProductWhereInputSchema.optional(),
    orderBy: z.union([ProductOrderByWithRelationInputSchema.array(), ProductOrderByWithRelationInputSchema]).optional(),
    cursor: ProductWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([ProductScalarFieldEnumSchema, ProductScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const ProductFindFirstOrThrowArgsSchema = z.object({
    select: ProductSelectSchema.optional(),
    include: ProductIncludeSchema.optional(),
    where: ProductWhereInputSchema.optional(),
    orderBy: z.union([ProductOrderByWithRelationInputSchema.array(), ProductOrderByWithRelationInputSchema]).optional(),
    cursor: ProductWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([ProductScalarFieldEnumSchema, ProductScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const ProductFindManyArgsSchema = z.object({
    select: ProductSelectSchema.optional(),
    include: ProductIncludeSchema.optional(),
    where: ProductWhereInputSchema.optional(),
    orderBy: z.union([ProductOrderByWithRelationInputSchema.array(), ProductOrderByWithRelationInputSchema]).optional(),
    cursor: ProductWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([ProductScalarFieldEnumSchema, ProductScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const ProductAggregateArgsSchema = z.object({
    where: ProductWhereInputSchema.optional(),
    orderBy: z.union([ProductOrderByWithRelationInputSchema.array(), ProductOrderByWithRelationInputSchema]).optional(),
    cursor: ProductWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const ProductGroupByArgsSchema = z.object({
    where: ProductWhereInputSchema.optional(),
    orderBy: z.union([ProductOrderByWithAggregationInputSchema.array(), ProductOrderByWithAggregationInputSchema]).optional(),
    by: ProductScalarFieldEnumSchema.array(),
    having: ProductScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const ProductFindUniqueArgsSchema = z.object({
    select: ProductSelectSchema.optional(),
    include: ProductIncludeSchema.optional(),
    where: ProductWhereUniqueInputSchema,
}).strict();
export const ProductFindUniqueOrThrowArgsSchema = z.object({
    select: ProductSelectSchema.optional(),
    include: ProductIncludeSchema.optional(),
    where: ProductWhereUniqueInputSchema,
}).strict();
export const VendorCustomersFindFirstArgsSchema = z.object({
    select: VendorCustomersSelectSchema.optional(),
    include: VendorCustomersIncludeSchema.optional(),
    where: VendorCustomersWhereInputSchema.optional(),
    orderBy: z.union([VendorCustomersOrderByWithRelationInputSchema.array(), VendorCustomersOrderByWithRelationInputSchema]).optional(),
    cursor: VendorCustomersWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([VendorCustomersScalarFieldEnumSchema, VendorCustomersScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const VendorCustomersFindFirstOrThrowArgsSchema = z.object({
    select: VendorCustomersSelectSchema.optional(),
    include: VendorCustomersIncludeSchema.optional(),
    where: VendorCustomersWhereInputSchema.optional(),
    orderBy: z.union([VendorCustomersOrderByWithRelationInputSchema.array(), VendorCustomersOrderByWithRelationInputSchema]).optional(),
    cursor: VendorCustomersWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([VendorCustomersScalarFieldEnumSchema, VendorCustomersScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const VendorCustomersFindManyArgsSchema = z.object({
    select: VendorCustomersSelectSchema.optional(),
    include: VendorCustomersIncludeSchema.optional(),
    where: VendorCustomersWhereInputSchema.optional(),
    orderBy: z.union([VendorCustomersOrderByWithRelationInputSchema.array(), VendorCustomersOrderByWithRelationInputSchema]).optional(),
    cursor: VendorCustomersWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([VendorCustomersScalarFieldEnumSchema, VendorCustomersScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const VendorCustomersAggregateArgsSchema = z.object({
    where: VendorCustomersWhereInputSchema.optional(),
    orderBy: z.union([VendorCustomersOrderByWithRelationInputSchema.array(), VendorCustomersOrderByWithRelationInputSchema]).optional(),
    cursor: VendorCustomersWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const VendorCustomersGroupByArgsSchema = z.object({
    where: VendorCustomersWhereInputSchema.optional(),
    orderBy: z.union([VendorCustomersOrderByWithAggregationInputSchema.array(), VendorCustomersOrderByWithAggregationInputSchema]).optional(),
    by: VendorCustomersScalarFieldEnumSchema.array(),
    having: VendorCustomersScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const VendorCustomersFindUniqueArgsSchema = z.object({
    select: VendorCustomersSelectSchema.optional(),
    include: VendorCustomersIncludeSchema.optional(),
    where: VendorCustomersWhereUniqueInputSchema,
}).strict();
export const VendorCustomersFindUniqueOrThrowArgsSchema = z.object({
    select: VendorCustomersSelectSchema.optional(),
    include: VendorCustomersIncludeSchema.optional(),
    where: VendorCustomersWhereUniqueInputSchema,
}).strict();
export const CustomerSubscriptionFindFirstArgsSchema = z.object({
    select: CustomerSubscriptionSelectSchema.optional(),
    include: CustomerSubscriptionIncludeSchema.optional(),
    where: CustomerSubscriptionWhereInputSchema.optional(),
    orderBy: z.union([CustomerSubscriptionOrderByWithRelationInputSchema.array(), CustomerSubscriptionOrderByWithRelationInputSchema]).optional(),
    cursor: CustomerSubscriptionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([CustomerSubscriptionScalarFieldEnumSchema, CustomerSubscriptionScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const CustomerSubscriptionFindFirstOrThrowArgsSchema = z.object({
    select: CustomerSubscriptionSelectSchema.optional(),
    include: CustomerSubscriptionIncludeSchema.optional(),
    where: CustomerSubscriptionWhereInputSchema.optional(),
    orderBy: z.union([CustomerSubscriptionOrderByWithRelationInputSchema.array(), CustomerSubscriptionOrderByWithRelationInputSchema]).optional(),
    cursor: CustomerSubscriptionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([CustomerSubscriptionScalarFieldEnumSchema, CustomerSubscriptionScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const CustomerSubscriptionFindManyArgsSchema = z.object({
    select: CustomerSubscriptionSelectSchema.optional(),
    include: CustomerSubscriptionIncludeSchema.optional(),
    where: CustomerSubscriptionWhereInputSchema.optional(),
    orderBy: z.union([CustomerSubscriptionOrderByWithRelationInputSchema.array(), CustomerSubscriptionOrderByWithRelationInputSchema]).optional(),
    cursor: CustomerSubscriptionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([CustomerSubscriptionScalarFieldEnumSchema, CustomerSubscriptionScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const CustomerSubscriptionAggregateArgsSchema = z.object({
    where: CustomerSubscriptionWhereInputSchema.optional(),
    orderBy: z.union([CustomerSubscriptionOrderByWithRelationInputSchema.array(), CustomerSubscriptionOrderByWithRelationInputSchema]).optional(),
    cursor: CustomerSubscriptionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const CustomerSubscriptionGroupByArgsSchema = z.object({
    where: CustomerSubscriptionWhereInputSchema.optional(),
    orderBy: z.union([CustomerSubscriptionOrderByWithAggregationInputSchema.array(), CustomerSubscriptionOrderByWithAggregationInputSchema]).optional(),
    by: CustomerSubscriptionScalarFieldEnumSchema.array(),
    having: CustomerSubscriptionScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const CustomerSubscriptionFindUniqueArgsSchema = z.object({
    select: CustomerSubscriptionSelectSchema.optional(),
    include: CustomerSubscriptionIncludeSchema.optional(),
    where: CustomerSubscriptionWhereUniqueInputSchema,
}).strict();
export const CustomerSubscriptionFindUniqueOrThrowArgsSchema = z.object({
    select: CustomerSubscriptionSelectSchema.optional(),
    include: CustomerSubscriptionIncludeSchema.optional(),
    where: CustomerSubscriptionWhereUniqueInputSchema,
}).strict();
export const RequestsFindFirstArgsSchema = z.object({
    select: RequestsSelectSchema.optional(),
    include: RequestsIncludeSchema.optional(),
    where: RequestsWhereInputSchema.optional(),
    orderBy: z.union([RequestsOrderByWithRelationInputSchema.array(), RequestsOrderByWithRelationInputSchema]).optional(),
    cursor: RequestsWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([RequestsScalarFieldEnumSchema, RequestsScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const RequestsFindFirstOrThrowArgsSchema = z.object({
    select: RequestsSelectSchema.optional(),
    include: RequestsIncludeSchema.optional(),
    where: RequestsWhereInputSchema.optional(),
    orderBy: z.union([RequestsOrderByWithRelationInputSchema.array(), RequestsOrderByWithRelationInputSchema]).optional(),
    cursor: RequestsWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([RequestsScalarFieldEnumSchema, RequestsScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const RequestsFindManyArgsSchema = z.object({
    select: RequestsSelectSchema.optional(),
    include: RequestsIncludeSchema.optional(),
    where: RequestsWhereInputSchema.optional(),
    orderBy: z.union([RequestsOrderByWithRelationInputSchema.array(), RequestsOrderByWithRelationInputSchema]).optional(),
    cursor: RequestsWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([RequestsScalarFieldEnumSchema, RequestsScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const RequestsAggregateArgsSchema = z.object({
    where: RequestsWhereInputSchema.optional(),
    orderBy: z.union([RequestsOrderByWithRelationInputSchema.array(), RequestsOrderByWithRelationInputSchema]).optional(),
    cursor: RequestsWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const RequestsGroupByArgsSchema = z.object({
    where: RequestsWhereInputSchema.optional(),
    orderBy: z.union([RequestsOrderByWithAggregationInputSchema.array(), RequestsOrderByWithAggregationInputSchema]).optional(),
    by: RequestsScalarFieldEnumSchema.array(),
    having: RequestsScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const RequestsFindUniqueArgsSchema = z.object({
    select: RequestsSelectSchema.optional(),
    include: RequestsIncludeSchema.optional(),
    where: RequestsWhereUniqueInputSchema,
}).strict();
export const RequestsFindUniqueOrThrowArgsSchema = z.object({
    select: RequestsSelectSchema.optional(),
    include: RequestsIncludeSchema.optional(),
    where: RequestsWhereUniqueInputSchema,
}).strict();
export const PushTokenFindFirstArgsSchema = z.object({
    select: PushTokenSelectSchema.optional(),
    include: PushTokenIncludeSchema.optional(),
    where: PushTokenWhereInputSchema.optional(),
    orderBy: z.union([PushTokenOrderByWithRelationInputSchema.array(), PushTokenOrderByWithRelationInputSchema]).optional(),
    cursor: PushTokenWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([PushTokenScalarFieldEnumSchema, PushTokenScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const PushTokenFindFirstOrThrowArgsSchema = z.object({
    select: PushTokenSelectSchema.optional(),
    include: PushTokenIncludeSchema.optional(),
    where: PushTokenWhereInputSchema.optional(),
    orderBy: z.union([PushTokenOrderByWithRelationInputSchema.array(), PushTokenOrderByWithRelationInputSchema]).optional(),
    cursor: PushTokenWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([PushTokenScalarFieldEnumSchema, PushTokenScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const PushTokenFindManyArgsSchema = z.object({
    select: PushTokenSelectSchema.optional(),
    include: PushTokenIncludeSchema.optional(),
    where: PushTokenWhereInputSchema.optional(),
    orderBy: z.union([PushTokenOrderByWithRelationInputSchema.array(), PushTokenOrderByWithRelationInputSchema]).optional(),
    cursor: PushTokenWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([PushTokenScalarFieldEnumSchema, PushTokenScalarFieldEnumSchema.array()]).optional(),
}).strict();
export const PushTokenAggregateArgsSchema = z.object({
    where: PushTokenWhereInputSchema.optional(),
    orderBy: z.union([PushTokenOrderByWithRelationInputSchema.array(), PushTokenOrderByWithRelationInputSchema]).optional(),
    cursor: PushTokenWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const PushTokenGroupByArgsSchema = z.object({
    where: PushTokenWhereInputSchema.optional(),
    orderBy: z.union([PushTokenOrderByWithAggregationInputSchema.array(), PushTokenOrderByWithAggregationInputSchema]).optional(),
    by: PushTokenScalarFieldEnumSchema.array(),
    having: PushTokenScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
}).strict();
export const PushTokenFindUniqueArgsSchema = z.object({
    select: PushTokenSelectSchema.optional(),
    include: PushTokenIncludeSchema.optional(),
    where: PushTokenWhereUniqueInputSchema,
}).strict();
export const PushTokenFindUniqueOrThrowArgsSchema = z.object({
    select: PushTokenSelectSchema.optional(),
    include: PushTokenIncludeSchema.optional(),
    where: PushTokenWhereUniqueInputSchema,
}).strict();
export const UserCreateArgsSchema = z.object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    data: z.union([UserCreateInputSchema, UserUncheckedCreateInputSchema]),
}).strict();
export const UserUpsertArgsSchema = z.object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereUniqueInputSchema,
    create: z.union([UserCreateInputSchema, UserUncheckedCreateInputSchema]),
    update: z.union([UserUpdateInputSchema, UserUncheckedUpdateInputSchema]),
}).strict();
export const UserCreateManyArgsSchema = z.object({
    data: z.union([UserCreateManyInputSchema, UserCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const UserCreateManyAndReturnArgsSchema = z.object({
    data: z.union([UserCreateManyInputSchema, UserCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const UserDeleteArgsSchema = z.object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereUniqueInputSchema,
}).strict();
export const UserUpdateArgsSchema = z.object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    data: z.union([UserUpdateInputSchema, UserUncheckedUpdateInputSchema]),
    where: UserWhereUniqueInputSchema,
}).strict();
export const UserUpdateManyArgsSchema = z.object({
    data: z.union([UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema]),
    where: UserWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const UserUpdateManyAndReturnArgsSchema = z.object({
    data: z.union([UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema]),
    where: UserWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const UserDeleteManyArgsSchema = z.object({
    where: UserWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const VendorCreateArgsSchema = z.object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    data: z.union([VendorCreateInputSchema, VendorUncheckedCreateInputSchema]),
}).strict();
export const VendorUpsertArgsSchema = z.object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereUniqueInputSchema,
    create: z.union([VendorCreateInputSchema, VendorUncheckedCreateInputSchema]),
    update: z.union([VendorUpdateInputSchema, VendorUncheckedUpdateInputSchema]),
}).strict();
export const VendorCreateManyArgsSchema = z.object({
    data: z.union([VendorCreateManyInputSchema, VendorCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const VendorCreateManyAndReturnArgsSchema = z.object({
    data: z.union([VendorCreateManyInputSchema, VendorCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const VendorDeleteArgsSchema = z.object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereUniqueInputSchema,
}).strict();
export const VendorUpdateArgsSchema = z.object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    data: z.union([VendorUpdateInputSchema, VendorUncheckedUpdateInputSchema]),
    where: VendorWhereUniqueInputSchema,
}).strict();
export const VendorUpdateManyArgsSchema = z.object({
    data: z.union([VendorUpdateManyMutationInputSchema, VendorUncheckedUpdateManyInputSchema]),
    where: VendorWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const VendorUpdateManyAndReturnArgsSchema = z.object({
    data: z.union([VendorUpdateManyMutationInputSchema, VendorUncheckedUpdateManyInputSchema]),
    where: VendorWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const VendorDeleteManyArgsSchema = z.object({
    where: VendorWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const ProductCreateArgsSchema = z.object({
    select: ProductSelectSchema.optional(),
    include: ProductIncludeSchema.optional(),
    data: z.union([ProductCreateInputSchema, ProductUncheckedCreateInputSchema]),
}).strict();
export const ProductUpsertArgsSchema = z.object({
    select: ProductSelectSchema.optional(),
    include: ProductIncludeSchema.optional(),
    where: ProductWhereUniqueInputSchema,
    create: z.union([ProductCreateInputSchema, ProductUncheckedCreateInputSchema]),
    update: z.union([ProductUpdateInputSchema, ProductUncheckedUpdateInputSchema]),
}).strict();
export const ProductCreateManyArgsSchema = z.object({
    data: z.union([ProductCreateManyInputSchema, ProductCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const ProductCreateManyAndReturnArgsSchema = z.object({
    data: z.union([ProductCreateManyInputSchema, ProductCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const ProductDeleteArgsSchema = z.object({
    select: ProductSelectSchema.optional(),
    include: ProductIncludeSchema.optional(),
    where: ProductWhereUniqueInputSchema,
}).strict();
export const ProductUpdateArgsSchema = z.object({
    select: ProductSelectSchema.optional(),
    include: ProductIncludeSchema.optional(),
    data: z.union([ProductUpdateInputSchema, ProductUncheckedUpdateInputSchema]),
    where: ProductWhereUniqueInputSchema,
}).strict();
export const ProductUpdateManyArgsSchema = z.object({
    data: z.union([ProductUpdateManyMutationInputSchema, ProductUncheckedUpdateManyInputSchema]),
    where: ProductWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const ProductUpdateManyAndReturnArgsSchema = z.object({
    data: z.union([ProductUpdateManyMutationInputSchema, ProductUncheckedUpdateManyInputSchema]),
    where: ProductWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const ProductDeleteManyArgsSchema = z.object({
    where: ProductWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const VendorCustomersCreateArgsSchema = z.object({
    select: VendorCustomersSelectSchema.optional(),
    include: VendorCustomersIncludeSchema.optional(),
    data: z.union([VendorCustomersCreateInputSchema, VendorCustomersUncheckedCreateInputSchema]),
}).strict();
export const VendorCustomersUpsertArgsSchema = z.object({
    select: VendorCustomersSelectSchema.optional(),
    include: VendorCustomersIncludeSchema.optional(),
    where: VendorCustomersWhereUniqueInputSchema,
    create: z.union([VendorCustomersCreateInputSchema, VendorCustomersUncheckedCreateInputSchema]),
    update: z.union([VendorCustomersUpdateInputSchema, VendorCustomersUncheckedUpdateInputSchema]),
}).strict();
export const VendorCustomersCreateManyArgsSchema = z.object({
    data: z.union([VendorCustomersCreateManyInputSchema, VendorCustomersCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const VendorCustomersCreateManyAndReturnArgsSchema = z.object({
    data: z.union([VendorCustomersCreateManyInputSchema, VendorCustomersCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const VendorCustomersDeleteArgsSchema = z.object({
    select: VendorCustomersSelectSchema.optional(),
    include: VendorCustomersIncludeSchema.optional(),
    where: VendorCustomersWhereUniqueInputSchema,
}).strict();
export const VendorCustomersUpdateArgsSchema = z.object({
    select: VendorCustomersSelectSchema.optional(),
    include: VendorCustomersIncludeSchema.optional(),
    data: z.union([VendorCustomersUpdateInputSchema, VendorCustomersUncheckedUpdateInputSchema]),
    where: VendorCustomersWhereUniqueInputSchema,
}).strict();
export const VendorCustomersUpdateManyArgsSchema = z.object({
    data: z.union([VendorCustomersUpdateManyMutationInputSchema, VendorCustomersUncheckedUpdateManyInputSchema]),
    where: VendorCustomersWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const VendorCustomersUpdateManyAndReturnArgsSchema = z.object({
    data: z.union([VendorCustomersUpdateManyMutationInputSchema, VendorCustomersUncheckedUpdateManyInputSchema]),
    where: VendorCustomersWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const VendorCustomersDeleteManyArgsSchema = z.object({
    where: VendorCustomersWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const CustomerSubscriptionCreateArgsSchema = z.object({
    select: CustomerSubscriptionSelectSchema.optional(),
    include: CustomerSubscriptionIncludeSchema.optional(),
    data: z.union([CustomerSubscriptionCreateInputSchema, CustomerSubscriptionUncheckedCreateInputSchema]),
}).strict();
export const CustomerSubscriptionUpsertArgsSchema = z.object({
    select: CustomerSubscriptionSelectSchema.optional(),
    include: CustomerSubscriptionIncludeSchema.optional(),
    where: CustomerSubscriptionWhereUniqueInputSchema,
    create: z.union([CustomerSubscriptionCreateInputSchema, CustomerSubscriptionUncheckedCreateInputSchema]),
    update: z.union([CustomerSubscriptionUpdateInputSchema, CustomerSubscriptionUncheckedUpdateInputSchema]),
}).strict();
export const CustomerSubscriptionCreateManyArgsSchema = z.object({
    data: z.union([CustomerSubscriptionCreateManyInputSchema, CustomerSubscriptionCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const CustomerSubscriptionCreateManyAndReturnArgsSchema = z.object({
    data: z.union([CustomerSubscriptionCreateManyInputSchema, CustomerSubscriptionCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const CustomerSubscriptionDeleteArgsSchema = z.object({
    select: CustomerSubscriptionSelectSchema.optional(),
    include: CustomerSubscriptionIncludeSchema.optional(),
    where: CustomerSubscriptionWhereUniqueInputSchema,
}).strict();
export const CustomerSubscriptionUpdateArgsSchema = z.object({
    select: CustomerSubscriptionSelectSchema.optional(),
    include: CustomerSubscriptionIncludeSchema.optional(),
    data: z.union([CustomerSubscriptionUpdateInputSchema, CustomerSubscriptionUncheckedUpdateInputSchema]),
    where: CustomerSubscriptionWhereUniqueInputSchema,
}).strict();
export const CustomerSubscriptionUpdateManyArgsSchema = z.object({
    data: z.union([CustomerSubscriptionUpdateManyMutationInputSchema, CustomerSubscriptionUncheckedUpdateManyInputSchema]),
    where: CustomerSubscriptionWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const CustomerSubscriptionUpdateManyAndReturnArgsSchema = z.object({
    data: z.union([CustomerSubscriptionUpdateManyMutationInputSchema, CustomerSubscriptionUncheckedUpdateManyInputSchema]),
    where: CustomerSubscriptionWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const CustomerSubscriptionDeleteManyArgsSchema = z.object({
    where: CustomerSubscriptionWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const RequestsCreateArgsSchema = z.object({
    select: RequestsSelectSchema.optional(),
    include: RequestsIncludeSchema.optional(),
    data: z.union([RequestsCreateInputSchema, RequestsUncheckedCreateInputSchema]),
}).strict();
export const RequestsUpsertArgsSchema = z.object({
    select: RequestsSelectSchema.optional(),
    include: RequestsIncludeSchema.optional(),
    where: RequestsWhereUniqueInputSchema,
    create: z.union([RequestsCreateInputSchema, RequestsUncheckedCreateInputSchema]),
    update: z.union([RequestsUpdateInputSchema, RequestsUncheckedUpdateInputSchema]),
}).strict();
export const RequestsCreateManyArgsSchema = z.object({
    data: z.union([RequestsCreateManyInputSchema, RequestsCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const RequestsCreateManyAndReturnArgsSchema = z.object({
    data: z.union([RequestsCreateManyInputSchema, RequestsCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const RequestsDeleteArgsSchema = z.object({
    select: RequestsSelectSchema.optional(),
    include: RequestsIncludeSchema.optional(),
    where: RequestsWhereUniqueInputSchema,
}).strict();
export const RequestsUpdateArgsSchema = z.object({
    select: RequestsSelectSchema.optional(),
    include: RequestsIncludeSchema.optional(),
    data: z.union([RequestsUpdateInputSchema, RequestsUncheckedUpdateInputSchema]),
    where: RequestsWhereUniqueInputSchema,
}).strict();
export const RequestsUpdateManyArgsSchema = z.object({
    data: z.union([RequestsUpdateManyMutationInputSchema, RequestsUncheckedUpdateManyInputSchema]),
    where: RequestsWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const RequestsUpdateManyAndReturnArgsSchema = z.object({
    data: z.union([RequestsUpdateManyMutationInputSchema, RequestsUncheckedUpdateManyInputSchema]),
    where: RequestsWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const RequestsDeleteManyArgsSchema = z.object({
    where: RequestsWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const PushTokenCreateArgsSchema = z.object({
    select: PushTokenSelectSchema.optional(),
    include: PushTokenIncludeSchema.optional(),
    data: z.union([PushTokenCreateInputSchema, PushTokenUncheckedCreateInputSchema]),
}).strict();
export const PushTokenUpsertArgsSchema = z.object({
    select: PushTokenSelectSchema.optional(),
    include: PushTokenIncludeSchema.optional(),
    where: PushTokenWhereUniqueInputSchema,
    create: z.union([PushTokenCreateInputSchema, PushTokenUncheckedCreateInputSchema]),
    update: z.union([PushTokenUpdateInputSchema, PushTokenUncheckedUpdateInputSchema]),
}).strict();
export const PushTokenCreateManyArgsSchema = z.object({
    data: z.union([PushTokenCreateManyInputSchema, PushTokenCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const PushTokenCreateManyAndReturnArgsSchema = z.object({
    data: z.union([PushTokenCreateManyInputSchema, PushTokenCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
}).strict();
export const PushTokenDeleteArgsSchema = z.object({
    select: PushTokenSelectSchema.optional(),
    include: PushTokenIncludeSchema.optional(),
    where: PushTokenWhereUniqueInputSchema,
}).strict();
export const PushTokenUpdateArgsSchema = z.object({
    select: PushTokenSelectSchema.optional(),
    include: PushTokenIncludeSchema.optional(),
    data: z.union([PushTokenUpdateInputSchema, PushTokenUncheckedUpdateInputSchema]),
    where: PushTokenWhereUniqueInputSchema,
}).strict();
export const PushTokenUpdateManyArgsSchema = z.object({
    data: z.union([PushTokenUpdateManyMutationInputSchema, PushTokenUncheckedUpdateManyInputSchema]),
    where: PushTokenWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const PushTokenUpdateManyAndReturnArgsSchema = z.object({
    data: z.union([PushTokenUpdateManyMutationInputSchema, PushTokenUncheckedUpdateManyInputSchema]),
    where: PushTokenWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
export const PushTokenDeleteManyArgsSchema = z.object({
    where: PushTokenWhereInputSchema.optional(),
    limit: z.number().optional(),
}).strict();
//# sourceMappingURL=index.js.map