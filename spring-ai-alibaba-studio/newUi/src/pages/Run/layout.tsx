/**
 * Copyright 2024 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import { Outlet, useNavigate, useLocation } from "ice";
import styles from "./layout.module.css";

import { ChatModelData } from '@/types/chat_model';
import { SubMenuItem } from "@/types/menu";
import chatModelsService from '@/services/chat-models';

export default function PageLayout() {
  const { Content, Sider } = Layout;
  const navigate = useNavigate();
  const location = useLocation();

  const [modelList, setModelList] = useState<ChatModelData[]>([]);
  const [runMenu, setRunMenu] = useState<SubMenuItem[]>([
    {
      key: "/run/clients",
      label: "Chat Client",
      children: []
    },
    {
      key: "/run/models",
      label: "Chat Model",
      children: []
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取ChatModel List
        const chatModelList = await chatModelsService.getChatModels();
        setModelList(chatModelList);

        // 更新runMenu的children
        setRunMenu((prevRunMenu) => {
          const updatedRunMenu = [...prevRunMenu];
          updatedRunMenu[1].children = chatModelList.map((model) => ({
            key: `/run/models/${model.name}`,
            label: model.name
          }));
          return updatedRunMenu;
        });
      } catch (error) {
        console.error("Failed to fetch chat models: ", error);
      }
    };
    fetchData();
  }, []);

  const [selectedKey, setSelectedKey] = useState(runMenu[0].key);

  const onMenuClick = (e) => {
    navigate(e.key);
    setSelectedKey(e.key);
  };

  useEffect(() => {
    if (location.pathname === "/run") {
      navigate("/run/clients");
      setSelectedKey(runMenu[0].key);
    }
  }, [location, runMenu]);

  return (
    <Layout className={styles.container}>
      <Sider width={200}>
        <Menu
          mode="inline"
          style={{ height: "100%", borderRight: 0 }}
          items={runMenu}
          onClick={onMenuClick}
          selectedKeys={[selectedKey]}
        />
      </Sider>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
}
