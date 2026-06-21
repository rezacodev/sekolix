"use client";

import { useMemo } from "react";
import { createMongoAbility } from "@casl/ability";
import { AbilityProvider as CASLAbilityProvider, Can, useAbility } from "@casl/react";
import type { AnyAbility } from "@casl/ability";
import type { AppAbility, AppAction, AppSubject } from "./types";

export { Can };

export function AbilityProvider({
  rules,
  children,
}: {
  rules: object[];
  children: React.ReactNode;
}) {
  const ability = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => createMongoAbility<[AppAction, AppSubject]>(rules as any),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(rules)]
  );
  return (
    <CASLAbilityProvider value={ability as unknown as AnyAbility}>
      {children}
    </CASLAbilityProvider>
  );
}

export function useAppAbility(): AppAbility {
  return useAbility<AppAbility>();
}

export function useCan(action: AppAction, subject: AppSubject): boolean {
  const ability = useAppAbility();
  return ability.can(action, subject);
}
