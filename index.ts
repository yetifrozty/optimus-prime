type Path<T, K> = K extends string ? K extends "" ? T :
  K extends `${infer P}.${infer R}` 
    ? P extends keyof T 
      ? Path<T[P], R> 
      : never
    : K extends keyof T 
      ? T[K] 
      : never
  : T;

type TestPath<T, K, A = K> = K extends string ? K extends "" ? A :
  K extends `${infer P}.${infer R}` 
    ? P extends keyof T 
      ? TestPath<T[P], R, A> 
      : never
    : K extends keyof T 
      ? A 
      : never
  : A;

type BaseResolver<Source, Target, From extends string | undefined> = Target extends Array<any> ? {
  each: Resolver<Path<Source, From>[any], Target[number]>;
} : Target extends Record<string | number | symbol, any> ? {
  fields: {
    [key in keyof Target]: Resolver<Path<Source, From>, Target[key]>;
  };
} : Target extends string | number | boolean | null | undefined ? {
  value: Target;
} : never

export type Resolver<Source, Target> = {
  from?: string;
} & BaseResolver<Source, Target, undefined>

export function createResolver<Source, Target, From extends string | undefined>(from: TestPath<Source, From>, resolver: BaseResolver<Source, Target, From> = {} as any): Resolver<Source, Target> {
  return {
    from,
    ...resolver
  } as unknown as Resolver<Source, Target>
}

export function loadData<Source, Target>(
  source: Source,
  resolver: Resolver<Source, Target>
): Target {
  const path = resolver.from !== "" && resolver.from?.split(".") || [];
  
  // Safely navigate the path within the source
  let current: any = source;
  
  for (const key of path) {
    if (current == null) {
      throw new Error(`Path ${path.join(' -> ')} is invalid.`);
    }
    current = current[key];
  }

  if ('fields' in resolver && resolver.fields) {
    const target: Partial<Target> = {};
    for (const key in resolver.fields) {
      if (resolver.fields.hasOwnProperty(key)) {
        // Recursively load data for each field
        target[key] = loadData(current, resolver.fields[key]) as any;
      }
    }
    return target as Target;
  } else if ('each' in resolver && resolver.each) {
    if (!Array.isArray(current)) {
      throw new Error(`Expected an array at path ${path.join(' -> ')} for 'each' resolver.`);
    }
    
    return current.map((item) => loadData(item, resolver.each!)) as Target;
  }

  // If neither 'fields' nor 'each' is present, return the current value
  return current as Target;
}