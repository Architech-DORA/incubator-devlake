/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { McsID, McsItem } from 'miller-columns-select';

import type { ScopeItemType } from '../../types';
import * as API from '../../api';

const DEFAULT_PAGE_SIZE = 50;

export interface UseMillerColumnsProps {
  connectionId: ID;
}
type MapPageType = Record<McsID | 'root', number>;

export const useMillerColumns = ({ connectionId }: UseMillerColumnsProps) => {
  const [items, setItems] = useState<McsItem<ScopeItemType>[]>([]);
  const [loadedIds, setLoadedIds] = useState<McsID[]>([]);
  const [mapPage, setMapPage] = useState<MapPageType>({});

  const customPrefix = `/plugins/kube_deployment/connections/${connectionId}`;

  const formatDeploymentItems = (arr: any, parentId: McsID | null = null) =>
    arr.map((deployment: any) => ({
      parentId: parentId,
      id: deployment,
      title: deployment,
      type: 'deployment',
    }));

  const formatNamespaceItems = (arr: any) =>
    arr.map((ns: any) => ({
      parentId: null,
      id: ns,
      title: ns,
      type: 'namespace',
    }));

  const setLoaded = useCallback(
    (loaded: boolean, id: McsID, nextPage: number) => {
      if (loaded) {
        setLoadedIds([...loadedIds, id]);
      } else {
        setMapPage({ ...mapPage, [`${id}`]: nextPage });
      }
    },
    [loadedIds, mapPage],
  );

  useEffect(() => {
    (async () => {
      const res = await API.getKubeNamespaces(customPrefix);
      setItems(formatNamespaceItems(res));
    })();
  }, [customPrefix]);

  const onExpand = useCallback(
    async (id: McsID) => {
      const res = await API.getKubeDeployments(`${customPrefix}/${id}`);

      const loaded = !res.length || res.length < DEFAULT_PAGE_SIZE;
      setLoaded(loaded, id, 2);
      setItems([...items, ...formatDeploymentItems(res, id)]);
    },
    [items, customPrefix],
  );

    

  return useMemo(
    () => ({
      items,
      getHasMore(id: McsID | null) {
        return !loadedIds.includes(id ?? 'root');
      },
      onExpand,
    }),
    [items, loadedIds],
  );
};
