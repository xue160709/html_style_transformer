import React from "react";
import {
    Button,
    Input,
    Typography,
    Space,
    Divider, message, Switch, Upload, Modal, ColorPicker, Select, Slider, Tabs
} from 'antd';

import { getConfig } from '../Utils'
import i18n from "i18next";
import {
    DeleteOutlined,
    UploadOutlined,
    MoreOutlined
} from "@ant-design/icons";

const { Text, Title } = Typography;

declare global {
    interface Window {
        global: any;
        electron: any;
    }
}

type PropType = {
    callback: any;
}

type StateType = {
    isShowModal: boolean,
    imageList: any[],
    editedImage: any,
    QRCode: string,
    SteveImg: string
}

interface ShareImageSetting {
    state: StateType;
    props: PropType
}

// 在 class ShareImageSetting 之前添加这个辅助函数
function hexToRgb(hex: string) {
    // 移除#号如果存在
    hex = hex.replace('#', '');

    // 将3位色值转换为6位
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
}

class ShareImageSetting extends React.Component {

    constructor(props: any) {
        super(props);
        this.state = {
            isShowModal: false,
            imageList: [],
            editedImage: null,
            QRCode: "",
            SteveImg: ""
        };
    }

    componentDidMount() {
        window.electron.getURL('QRCode.png').then((res: string) => {
            this.setState({
                QRCode: res
            })
        });

        window.electron.getURL('steve.png').then((res: string) => {
            this.setState({
                SteveImg: res
            })
        });

        const r = () => this.getImageList().then((list) => {
            this.setState({ imageList: list });
        });

        r()
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        // 组件更新时的逻辑
        // ...
    }

    componentWillUnmount() {
        // 组件卸载时的逻辑
        // ...
    }

    async getImageList() {
        let ImageList = await window.electron.getMyShareImagesConfig();
        console.log("ImageList", ImageList)
        return ImageList
    }

    _isSubscribeVip() {
        const result = localStorage.getItem('RoleVipKey')
        const RoleVipKey = getConfig().roleVipKey
        //return (result === RoleVipKey || window.electron.isDev);
        return true //先不做限制，让他们使劲制作好了
    }

    OpenModal = (item: any) => {
        this.setState({
            isShowModal: true,
            editedImage: item
        });
        console.log("item", item)
    }

    modifyImage = async (item: any) => {
        let imageList = [...this.state.imageList];

        const index = imageList.findIndex((img) => img.id === item.id);
        if (index !== -1) {
            imageList[index] = item; // 将item替换到imageList数组中
        }

        this.setState({
            imageList: imageList,
            isShowModal: false,
        });

        // 从imageList数组中剔除id是0的元素
        const imageList2Save = imageList.filter((img) => img.id !== 0);
        await window.electron.updateMyShareImagesConfig(imageList2Save);
    }


    deleteImage = async (item: any) => {
        //删除图片
        const imageList = this.state.imageList.filter(img => img.id !== item.id);

        this.setState({
            imageList: imageList
        });

        //从imageList2Save数组中剔除id是0的元素
        const imageList2Save = imageList.filter((img) => img.id !== 0);
        await window.electron.updateMyShareImagesConfig(imageList2Save);
    }


    ModalRender = () => {
        const { editedImage } = this.state;
        const strongStyle = {
            ...editedImage.strong
        };
        console.log("#editedImage", editedImage)
        return (
            <div>
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                    {/* Left side div */}
                    <div
                        style={{
                            flex: "0 0 320px",
                            maxWidth: "320px",
                            marginTop: 20,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: editedImage.background.backgroundColor,
                            backgroundImage: editedImage.background.backgroundImage,
                            fontSize: 12
                        }}>
                        {editedImage.header.showHeader &&
                            <div
                                style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
                            >
                                <img src={editedImage.header.headerImage}
                                    style={{ width: "100%", marginBottom: 5, borderRadius: 10 }} alt="Header" />
                            </div>
                        }
                        <div style={{
                            borderRadius: editedImage.card?.borderRadius || 10,
                            backgroundColor: editedImage.card?.isGlassmorphism ?
                                `rgba(${hexToRgb(editedImage.card?.backgroundColor || "#FFFFFF")}, ${editedImage.card?.opacity || 1})` :
                                `rgba(${hexToRgb(editedImage.card?.backgroundColor || "#FFFFFF")}, ${editedImage.card?.opacity || 1})`,
                            color: editedImage.card?.textColor || "#000000",
                            backdropFilter: editedImage.card?.isGlassmorphism ? `blur(${editedImage.card.blur}px)` : 'none',
                            WebkitBackdropFilter: editedImage.card?.isGlassmorphism ? `blur(${editedImage.card.blur}px)` : 'none',
                            boxShadow: editedImage.card?.hasShadow ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)' : 'none',
                            padding: editedImage.card?.padding || 10,
                            width: editedImage.card?.width || 240,
                            margin: `${editedImage.card?.verticalSpacing || 20}px auto`,
                            boxSizing: "border-box"
                        }}>
                            <div style={{ width: "100%", marginBottom: 10 }}>
                                <img
                                    src={this.state.SteveImg}
                                    style={{
                                        width: "100%",
                                        borderRadius: editedImage.card?.borderRadius || 10,
                                        display: "block"
                                    }}
                                />
                            </div>
                            <div>
                                <h3 style={{ marginTop: 10, marginBottom: 5 }}>Steve Jobs Quotes</h3>
                                <p style={{ textAlign: "justify", width: "100%", margin: 0, whiteSpace: "pre-line", textJustify: "auto" }}>
                                    <li>1. The only way to do great work is to <strong
                                        style={{ ...strongStyle }}>love</strong> what you do.
                                    </li>
                                    <li>2. Your time is limited, so <strong style={{ ...strongStyle }}>don’t
                                        waste</strong> it living someone else’s life.
                                    </li>
                                    <li>3. Innovation distinguishes between a <strong
                                        style={{ ...strongStyle }}>leader</strong> and a follower.
                                    </li>
                                    <li>4. <strong style={{ ...strongStyle }}>Stay hungry, stay foolish.</strong></li>
                                    <li>5. Remembering that <strong style={{ ...strongStyle }}>you are going to
                                        die</strong> is the best way I know to avoid the trap of thinking you have
                                        something to lose.
                                    </li>
                                </p>
                                {editedImage.footer.showFooter && (
                                    <div
                                        style={{ marginTop: 20, marginBottom: 5, display: "flex", justifyContent: (editedImage.footer.showBrand && editedImage.footer.showQrCode) ? "space-between" : "center", alignItems: "center" }}>
                                        {editedImage.footer.showBrand &&
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <img src={editedImage.avatar} alt="Avatar" width={40}
                                                    style={{ borderRadius: 20 }} />
                                                <div style={{ marginLeft: 10 }}>
                                                    <div style={{ fontSize: 10 }}>{editedImage.nickname}</div>
                                                    <div style={{ fontSize: 10 }}>{i18n.t('Shared a Note')}</div>
                                                </div>
                                            </div>
                                        }
                                        {editedImage.footer.showQrCode &&
                                            <img style={{ width: 50 }} src={editedImage.QRCode || this.state.QRCode} alt="QRCode" />}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                fontSize: 10,
                                color: "rgba(255,255,255,0.9)",
                                marginTop: 10,
                                marginBottom: 10,
                                fontWeight: "bold",
                                textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
                            }}
                        >
                            Created by MiX Copilot
                        </div>
                    </div>
                    {/* Right side controls and parameters */}
                    <Space style={{ padding: 10, marginTop: 10, marginLeft: 10 }} direction={"vertical"}>
                        <Title level={5} style={{ margin: 0 }}>{i18n.t('Base Information')}</Title>
                        <Space direction={"horizontal"} style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text>{i18n.t('Template Name')}</Text>
                            <Input
                                placeholder="Name"
                                style={{ width: 120 }}
                                value={editedImage.name}
                                onChange={(e) =>
                                    this.setState({ editedImage: { ...editedImage, name: e.target.value } })
                                }
                            />
                        </Space>
                        <Divider style={{ marginTop: 5, marginBottom: 5 }} />

                        <Tabs defaultActiveKey="1">
                            <Tabs.TabPane tab={i18n.t('Card Style')} key="1" style={{ maxHeight: "480px", overflowY: "auto" }}>
                                <Space direction={"vertical"} style={{ width: "100%" }} size={"middle"}>
                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Title level={5} style={{ margin: 0 }}>{i18n.t('Background Setting')}</Title>
                                        <Button
                                            type="text"
                                            onClick={() => {
                                                window.electron.openURL("https://www.grabient.com/")
                                            }}
                                            icon={<MoreOutlined />}
                                        />
                                    </Space>
                                    <Space direction={"horizontal"} size={"small"}>
                                        {/* 添加微信日记风格背景 */}
                                        <Button style={{
                                            width: 20,
                                            backgroundColor: "#f5fffa",
                                            backgroundImage: `radial-gradient(circle at 90% 10%, rgba(128, 216, 168, 0.4) 0%, rgba(128, 216, 168, 0.1) 30%, transparent 70%),
                                                                radial-gradient(circle at 90% 90%, rgba(176, 224, 230, 0.4) 0%, rgba(176, 224, 230, 0.1) 25%, transparent 60%)`
                                        }}
                                            onClick={(e) => {
                                                const background = editedImage.background
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        background: {
                                                            ...background,
                                                            backgroundColor: "#f5fffa",
                                                            backgroundImage: `radial-gradient(circle at 90% 10%, rgba(128, 216, 168, 0.4) 0%, rgba(128, 216, 168, 0.1) 30%, transparent 70%),
                                                                                radial-gradient(circle at 90% 90%, rgba(176, 224, 230, 0.4) 0%, rgba(176, 224, 230, 0.1) 25%, transparent 60%)`
                                                        }
                                                    }
                                                })
                                            }}
                                        />

                                        {/* 添加另一个变体 - 粉色系 */}
                                        <Button style={{
                                            width: 20,
                                            backgroundColor: "#fff5f5",
                                            backgroundImage: `radial-gradient(circle at 90% 10%, rgba(255, 182, 193, 0.4) 0%, rgba(255, 182, 193, 0.1) 30%, transparent 70%),
                                                                radial-gradient(circle at 85% 85%, rgba(221, 160, 221, 0.4) 0%, rgba(221, 160, 221, 0.1) 25%, transparent 60%)`
                                        }}
                                            onClick={(e) => {
                                                const background = editedImage.background
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        background: {
                                                            ...background,
                                                            backgroundColor: "#fff5f5",
                                                            backgroundImage: `radial-gradient(circle at 90% 10%, rgba(255, 182, 193, 0.4) 0%, rgba(255, 182, 193, 0.1) 30%, transparent 70%),
                                                                                radial-gradient(circle at 85% 85%, rgba(221, 160, 221, 0.4) 0%, rgba(221, 160, 221, 0.1) 25%, transparent 60%)`
                                                        }
                                                    }
                                                })
                                            }}
                                        />
                                        {/* 光斑效果 */}
                                        <Button style={{
                                            width: 20,
                                            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%),
                                                            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%),
                                                            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%),
                                                            radial-gradient(circle at 10% 90%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%)`,
                                            backgroundColor: "#7c9885"
                                        }}
                                            onClick={(e) => {
                                                const background = editedImage.background
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        background: {
                                                            ...background,
                                                            backgroundColor: "#7c9885",
                                                            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%),
                                                                            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%),
                                                                            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%),
                                                                            radial-gradient(circle at 10% 90%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%)`
                                                        }
                                                    }
                                                })
                                            }}
                                        />

                                        {/* 几何图案 - 波浪线 */}
                                        <Button style={{
                                            width: 20,
                                            backgroundColor: "#f3f4f6",
                                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)`
                                        }}
                                            onClick={(e) => {
                                                const background = editedImage.background
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        background: {
                                                            ...background,
                                                            backgroundColor: "#f3f4f6",
                                                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)`
                                                        }
                                                    }
                                                })
                                            }}
                                        />

                                        {/* 光晕效果 */}
                                        <Button style={{
                                            width: 20,
                                            backgroundColor: "#2d3436",
                                            backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0) 70%),
                                                                radial-gradient(circle at 60% 40%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)`
                                        }}
                                            onClick={(e) => {
                                                const background = editedImage.background
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        background: {
                                                            ...background,
                                                            backgroundColor: "#2d3436",
                                                            backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0) 70%),
                                                                                radial-gradient(circle at 60% 40%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)`
                                                        }
                                                    }
                                                })
                                            }}
                                        />
                                        <Button style={{
                                            width: 20,
                                            backgroundColor: "#FFDEE9",
                                            backgroundImage: "linear-gradient(0deg, #FFDEE9 0%, #B5FFFC 100%)"
                                        }}
                                            onClick={(e) => {
                                                const background = editedImage.background
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        background: {
                                                            ...background,
                                                            backgroundColor: "#FFDEE9",
                                                            backgroundImage: "linear-gradient(0deg, #FFDEE9 0%, #B5FFFC 100%)"
                                                        }
                                                    }
                                                })
                                            }}
                                        />
                                        <Button style={{
                                            width: 20,
                                            backgroundColor: "#21D4FD",
                                            backgroundImage: "linear-gradient(0deg, #21D4FD 0%, #B721FF 100%)"
                                        }}
                                            onClick={(e) => {
                                                const background = editedImage.background
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        background: {
                                                            ...background,
                                                            backgroundColor: "#21D4FD",
                                                            backgroundImage: "linear-gradient(0deg, #21D4FD 0%, #B721FF 100%)"
                                                        }
                                                    }
                                                })
                                            }}
                                        />
                                        <Button style={{
                                            width: 20,
                                            backgroundColor: "#FFE53B",
                                            backgroundImage: "linear-gradient(180deg, #FFE53B 0%, #FF2525 74%)"
                                        }}
                                            onClick={(e) => {
                                                const background = editedImage.background
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        background: {
                                                            ...background,
                                                            backgroundColor: "#FFE53B",
                                                            backgroundImage: "linear-gradient(180deg, #FFE53B 0%, #FF2525 74%)"
                                                        }
                                                    }
                                                })
                                            }}
                                        />
                                        <Button
                                            style={{ width: 20, backgroundColor: "#4158D0", backgroundImage: "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)" }}
                                            onClick={(e) => {
                                                const background = editedImage.background
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        background: {
                                                            ...background,
                                                            backgroundColor: "#4158D0",
                                                            backgroundImage: "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
                                                        }
                                                    }
                                                })
                                            }}
                                        />
                                    </Space>
                                    <div style={{ display: "flex" }}>
                                        <Input placeholder={i18n.t('Paste a CSS')}
                                            onChange={(e) => {
                                                const inputValue = e.target.value;
                                                let backgroundColor = '';
                                                let backgroundImage = '';

                                                // 将用户输入的内容按行拆分
                                                const lines = inputValue.split(';').map(line => line.trim()).filter(line => line);

                                                // 解析每一行内容
                                                lines.forEach(line => {
                                                    if (line.startsWith('background-color:')) {
                                                        backgroundColor = line.split(':')[1].trim();
                                                    } else if (line.startsWith('background-image:')) {
                                                        backgroundImage = line.split(':')[1].trim();
                                                    }
                                                });

                                                // 检查是否成功解析到背景颜色和背景图片
                                                if (backgroundColor && backgroundImage) {
                                                    const background = editedImage.background
                                                    this.setState({
                                                        editedImage: {
                                                            ...this.state.editedImage,
                                                            background: {
                                                                ...background,
                                                                backgroundColor: backgroundColor,
                                                                backgroundImage: backgroundImage
                                                            }
                                                        }
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                    {/* <Space style={{display: "flex", justifyContent: "space-between"}}>
                                        <Text>{i18n.t('BackgroundColor')}</Text>
                                        <Text>{editedImage.background.backgroundColor}</Text>
                                    </Space>
                                    <Space style={{display: "flex", justifyContent: "space-between"}}>
                                        <Text>{i18n.t('BackgroundImage')}</Text>
                                        <Tooltip title={editedImage.background.backgroundImage} showArrow={false}>
                                            <Text>{editedImage.background.backgroundImage.length > 30 ? `${editedImage.background.backgroundImage.slice(0, 20)}...` : editedImage.background.backgroundImage}</Text>
                                        </Tooltip>
                                    </Space> */}
                                    <Divider style={{ marginTop: 5, marginBottom: 5 }} />
                                    <Title level={5} style={{ margin: 0 }}>{i18n.t('Card Setting')}</Title>
                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text>{i18n.t('Card Background Color')}</Text>
                                        <ColorPicker
                                            value={editedImage.card?.backgroundColor || "#FFFFFF"}
                                            showText
                                            onChange={(e) => {
                                                const card = editedImage.card || {
                                                    isGlassmorphism: false,
                                                    hasShadow: false,
                                                    opacity: 1,
                                                    blur: 10,
                                                    backgroundColor: "#FFFFFF",
                                                    textColor: "#000000"
                                                };
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        card: { ...card, backgroundColor: e.toHexString() }
                                                    }
                                                })
                                            }}
                                        />
                                    </Space>

                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text>{i18n.t('Card Text Color')}</Text>
                                        <ColorPicker
                                            value={editedImage.card?.textColor || "#000000"}
                                            showText
                                            onChange={(e) => {
                                                const card = editedImage.card || {
                                                    isGlassmorphism: false,
                                                    hasShadow: false,
                                                    opacity: 1,
                                                    blur: 10,
                                                    backgroundColor: "#FFFFFF",
                                                    textColor: "#000000"
                                                };
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        card: { ...card, textColor: e.toHexString() }
                                                    }
                                                })
                                            }}
                                        />
                                    </Space>

                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text>{i18n.t('Card Opacity')}</Text>
                                        <Slider
                                            min={0}
                                            max={20}
                                            value={Math.round(((editedImage.card?.opacity || 1) * 20))}
                                            style={{ width: 100, marginRight: 10 }}
                                            onChange={(value) => {
                                                const card = editedImage.card || {
                                                    isGlassmorphism: false,
                                                    hasShadow: false,
                                                    opacity: 1,
                                                    blur: 10,
                                                    backgroundColor: "#FFFFFF",
                                                    textColor: "#000000"
                                                };
                                                const mappedOpacity = value / 20;
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        card: { ...card, opacity: mappedOpacity }
                                                    }
                                                })
                                            }}
                                        />
                                    </Space>

                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text>{i18n.t('Card Border Radius')}</Text>
                                        <Slider
                                            min={0}
                                            max={20}
                                            value={editedImage.card?.borderRadius || 10}
                                            style={{ width: 100, marginRight: 10 }}
                                            onChange={(value) => {
                                                const card = editedImage.card || {
                                                    isGlassmorphism: false,
                                                    hasShadow: false,
                                                    opacity: 1,
                                                    blur: 10,
                                                    backgroundColor: "#FFFFFF",
                                                    textColor: "#000000",
                                                    borderRadius: 10
                                                };
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        card: { ...card, borderRadius: value }
                                                    }
                                                })
                                            }}
                                        />
                                    </Space>
                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text>{i18n.t('Glass Effect')}</Text>
                                        <Switch
                                            checked={editedImage.card?.isGlassmorphism || false}
                                            onChange={(checked) => {
                                                const card = editedImage.card || {
                                                    isGlassmorphism: false,
                                                    hasShadow: false,
                                                    opacity: 1,
                                                    blur: 10,
                                                };
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        card: { ...card, isGlassmorphism: checked }
                                                    }
                                                })
                                            }}
                                        />
                                    </Space>

                                    {editedImage.card?.isGlassmorphism && (
                                        <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                            <Text>{i18n.t('Blur Level')}</Text>
                                            <Slider
                                                min={1}
                                                max={20}
                                                value={Math.round((editedImage.card?.blur || 10) / 15)}
                                                style={{ width: 100, marginRight: 10 }}
                                                onChange={(value) => {
                                                    const card = editedImage.card || {
                                                        isGlassmorphism: true,
                                                        hasShadow: false,
                                                        opacity: 1,
                                                        blur: 10,
                                                    };
                                                    const mappedBlur = value * 15;
                                                    this.setState({
                                                        editedImage: {
                                                            ...editedImage,
                                                            card: { ...card, blur: mappedBlur }
                                                        }
                                                    })
                                                }}
                                            />
                                        </Space>
                                    )}

                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text>{i18n.t('Card Shadow')}</Text>
                                        <Switch
                                            checked={editedImage.card?.hasShadow || false}
                                            onChange={(checked) => {
                                                const card = editedImage.card || {
                                                    isGlassmorphism: false,
                                                    hasShadow: false,
                                                    opacity: 1,
                                                    blur: 10,
                                                };
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        card: { ...card, hasShadow: checked }
                                                    }
                                                })
                                            }}
                                        />
                                    </Space>

                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text>{i18n.t('Card Padding')}</Text>
                                        <Slider
                                            min={0}
                                            max={30}
                                            value={editedImage.card?.padding || 10}
                                            style={{ width: 100, marginRight: 10 }}
                                            onChange={(value) => {
                                                const card = editedImage.card || {
                                                    isGlassmorphism: false,
                                                    hasShadow: false,
                                                    opacity: 1,
                                                    blur: 10,
                                                    backgroundColor: "#FFFFFF",
                                                    textColor: "#000000",
                                                    padding: 10
                                                };
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        card: { ...card, padding: value }
                                                    }
                                                })
                                            }}
                                        />
                                    </Space>

                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text>{i18n.t('Card Width')}</Text>
                                        <Slider
                                            min={240}
                                            max={280}
                                            value={editedImage.card?.width || 240}
                                            style={{ width: 100, marginRight: 10 }}
                                            onChange={(value) => {
                                                const card = editedImage.card || {
                                                    isGlassmorphism: false,
                                                    hasShadow: false,
                                                    opacity: 1,
                                                    blur: 10,
                                                    backgroundColor: "#FFFFFF",
                                                    textColor: "#000000",
                                                    width: 240
                                                };
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        card: { ...card, width: value }
                                                    }
                                                })
                                            }}
                                        />
                                    </Space>

                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text>{i18n.t('Card Vertical Spacing')}</Text>
                                        <Slider
                                            min={10}
                                            max={40}
                                            value={editedImage.card?.verticalSpacing || 20}
                                            style={{ width: 100, marginRight: 10 }}
                                            onChange={(value) => {
                                                const card = editedImage.card || {
                                                    isGlassmorphism: false,
                                                    hasShadow: false,
                                                    opacity: 1,
                                                    blur: 10,
                                                    backgroundColor: "#FFFFFF",
                                                    textColor: "#000000",
                                                    width: 240,
                                                    verticalSpacing: 20
                                                };
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        card: { ...card, verticalSpacing: value }
                                                    }
                                                })
                                            }}
                                        />
                                    </Space>
                                </Space>
                            </Tabs.TabPane>

                            <Tabs.TabPane tab={i18n.t('Header Setting')} key="2">
                                <Space direction={"vertical"} style={{ width: "100%" }} size={"middle"}>
                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text>{i18n.t('showHeader')}</Text>
                                        <Switch
                                            checked={editedImage.header.showHeader}
                                            onChange={(checked) => {
                                                const header = editedImage.header
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        header: { ...header, showHeader: checked }
                                                    }
                                                })
                                            }}
                                        />
                                    </Space>
                                    {editedImage.header.showHeader && (
                                        <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                            <Text>{i18n.t('HeaderImage')}</Text>
                                            <Upload
                                                showUploadList={false}
                                                beforeUpload={(file) => {
                                                    const isValidType = file.type === 'image/svg+xml' || file.type === 'image/png' || file.type === 'image/jpeg';

                                                    if (!isValidType) {
                                                        message.error(i18n.t('uploadWarning'));
                                                        return false;
                                                    }

                                                    const reader = new FileReader();
                                                    reader.onload = (e) => {
                                                        const header = editedImage.header
                                                        this.setState({
                                                            editedImage: {
                                                                ...editedImage,
                                                                // @ts-ignore
                                                                header: { ...header, headerImage: e.target.result }
                                                            },
                                                        });
                                                    };
                                                    reader.readAsDataURL(file);
                                                    return false;  // 阻止上传
                                                }}
                                            >
                                                <Button icon={<UploadOutlined />}>{i18n.t('upload')}</Button>
                                            </Upload>
                                        </Space>
                                    )}
                                </Space>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab={i18n.t('Footer Setting')} key="3">
                                <Space direction={"vertical"} style={{ width: "100%" }} size={"middle"}>
                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text>{i18n.t('showFooter')}</Text>
                                        <Switch
                                            checked={editedImage.footer.showFooter}
                                            onChange={(checked) => {
                                                const footer = editedImage.footer
                                                this.setState({
                                                    editedImage: {
                                                        ...editedImage,
                                                        footer: {
                                                            ...footer,
                                                            showFooter: checked
                                                        }
                                                    }
                                                })
                                            }}
                                        />
                                    </Space>
                                    {editedImage.footer.showFooter && (
                                        <>
                                            <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                                <Text>{i18n.t('showQrCode')}</Text>
                                                <Switch
                                                    checked={editedImage.footer.showQrCode}
                                                    onChange={(checked) => {
                                                        const footer = editedImage.footer
                                                        this.setState({
                                                            editedImage: {
                                                                ...editedImage,
                                                                footer: {
                                                                    ...footer,
                                                                    showQrCode: checked
                                                                }
                                                            }
                                                        })
                                                    }}
                                                />
                                            </Space>
                                            {
                                                editedImage.footer.showQrCode && <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <Text>{i18n.t('setQRCode')}</Text>
                                                    <Upload
                                                        showUploadList={false}
                                                        beforeUpload={(file) => {
                                                            const isValidType = file.type === 'image/svg+xml' || file.type === 'image/png' || file.type === 'image/jpeg';

                                                            if (!isValidType) {
                                                                message.error(i18n.t('uploadWarning'));
                                                                return false;
                                                            }

                                                            const reader = new FileReader();
                                                            reader.onload = (e) => {
                                                                // @ts-ignore
                                                                this.setState({ editedImage: { ...editedImage, QRCode: e.target.result } });
                                                            };
                                                            reader.readAsDataURL(file);
                                                            return false;  // 阻止上传
                                                        }}
                                                    >
                                                        <Button icon={<UploadOutlined />}>{i18n.t('upload')}</Button>
                                                    </Upload>
                                                </Space>
                                            }
                                            <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                                <Text>{i18n.t('showBrand')}</Text>
                                                <Switch
                                                    checked={editedImage.footer.showBrand}
                                                    onChange={(checked) => {
                                                        const footer = editedImage.footer
                                                        this.setState({
                                                            editedImage: {
                                                                ...editedImage,
                                                                footer: {
                                                                    ...footer,
                                                                    showBrand: checked
                                                                }
                                                            }
                                                        })
                                                    }}
                                                />
                                            </Space>
                                            <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                                <Text>{i18n.t('setAvatar')}</Text>
                                                <Upload
                                                    showUploadList={false}
                                                    beforeUpload={(file) => {
                                                        const isValidType = file.type === 'image/svg+xml' || file.type === 'image/png' || file.type === 'image/jpeg';

                                                        if (!isValidType) {
                                                            message.error(i18n.t('uploadWarning'));
                                                            return false;
                                                        }

                                                        const reader = new FileReader();
                                                        reader.onload = (e) => {
                                                            // @ts-ignore
                                                            this.setState({ editedImage: { ...editedImage, avatar: e.target.result } });
                                                        };
                                                        reader.readAsDataURL(file);
                                                        return false;  // 阻止上传
                                                    }}
                                                >
                                                    <Button icon={<UploadOutlined />}>{i18n.t('upload')}</Button>
                                                </Upload>
                                            </Space>
                                            <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                                <Text>{i18n.t('setNickname')}</Text>
                                                <Input
                                                    placeholder="Nickname"
                                                    style={{ width: 120 }}
                                                    value={editedImage.nickname}
                                                    onChange={(e) =>
                                                        this.setState({
                                                            editedImage: { ...editedImage, nickname: e.target.value },
                                                        })
                                                    }
                                                />
                                            </Space>
                                            {
                                                window.electron.isDev && <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <Text>{i18n.t('description')}</Text>
                                                    <Input
                                                        placeholder="description"
                                                        style={{ width: 120 }}
                                                        value={editedImage.description}
                                                        onChange={(e) =>
                                                            this.setState({
                                                                editedImage: { ...editedImage, description: e.target.value },
                                                            })
                                                        }
                                                    />
                                                </Space>
                                            }
                                        </>
                                    )}
                                </Space>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab={i18n.t('Important Content Setting')} key="4">
                                <Space direction={"vertical"} style={{ width: "100%" }} size={"middle"}>
                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text>{i18n.t('Keyword Color')}</Text>
                                        <ColorPicker
                                            style={{ minWidth: 100 }}
                                            value={editedImage.strong.themeColor || "#3F7B7C"}
                                            showText
                                            onChange={(e) => {
                                                const strong = editedImage.strong
                                                const { themeColor, color, backgroundColor, textDecorationColor } = strong
                                                console.log("themeColor", themeColor, color, backgroundColor)

                                                this.setState({
                                                    editedImage: {
                                                        ...this.state.editedImage,
                                                        strong: {
                                                            ...strong,
                                                            themeColor: e.toHexString(),
                                                            color: e.toHexString(),
                                                            // backgroundColor: e.toHexString(),
                                                            // textDecorationColor: e.toHexString()
                                                            // color: color == themeColor ? e.toHexString() :  color,
                                                            backgroundColor: backgroundColor == themeColor ? e.toHexString() : backgroundColor,
                                                            textDecorationColor: textDecorationColor == themeColor ? e.toHexString() : textDecorationColor
                                                        }
                                                    }
                                                })
                                            }} />
                                    </Space>
                                    <Space style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text>{i18n.t('Keyword Style')}</Text>
                                        <Select
                                            value={editedImage.strong.template}
                                            style={{ width: 120 }}
                                            options={[
                                                { value: "bold", label: i18n.t('bold') },
                                                { value: "highlight", label: i18n.t('highlight') },
                                                { value: "wavy line", label: i18n.t('wavy line') },
                                            ]}
                                            onChange={(e) => {
                                                let strong = {}
                                                const oldStrong = editedImage.strong
                                                console.log("oldSpan", oldStrong)
                                                if (e === "bold") {
                                                    strong = {
                                                        template: "bold",
                                                        color: oldStrong.themeColor,
                                                        fontWeight: "bold",
                                                        padding: "0px",
                                                        textDecorationLine: "none",
                                                        textDecorationColor: "none",
                                                        marginBottom: "0",
                                                        marginTop: "0",
                                                        backgroundColor: "transparent",
                                                        borderRadius: "0",
                                                    }
                                                } else if (e === "highlight") {
                                                    strong = {
                                                        template: "highlight",
                                                        color: "white",
                                                        fontWeight: "normal",
                                                        backgroundColor: oldStrong.themeColor,
                                                        padding: "1px 4px", // 调整内边距,让文字周围有更好的呼吸空间
                                                        textDecorationLine: "none",
                                                        textDecorationColor: "none",
                                                        marginBottom: "2px",
                                                        marginTop: "2px",
                                                        marginRight: "2px",
                                                        borderRadius: "2px", // 添加圆角效果
                                                    }
                                                } else if (e === "wavy line") {
                                                    strong = {
                                                        template: "wavy line",
                                                        color: "black",
                                                        fontWeight: "normal",
                                                        textDecorationLine: "underline",
                                                        textDecorationStyle: "wavy",
                                                        textDecorationColor: oldStrong.themeColor,
                                                        textDecorationThickness: "2px",
                                                        marginBottom: "2px",
                                                        marginTop: "0",
                                                        borderRadius: "0",
                                                        backgroundColor: "transparent",
                                                    }
                                                }

                                                this.setState({
                                                    editedImage: {
                                                        ...this.state.editedImage,
                                                        strong: {
                                                            ...oldStrong,
                                                            ...strong
                                                        }
                                                    }
                                                })
                                            }}
                                        />
                                    </Space>
                                </Space>
                            </Tabs.TabPane>
                        </Tabs>
                    </Space>
                </div>
                <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                    <Button type={"primary"} style={{ marginRight: 10 }}
                        onClick={async () => {
                            await this.modifyImage(editedImage)
                        }}
                    >{i18n.t('modify')}</Button>
                    <Button onClick={async () => {
                        this.setState({
                            isShowModal: false
                        })
                    }}>{i18n.t('cancel')}</Button>
                </div>
            </div>
        );
    };

    AddImage = async () => {
        this.setState({ isShowModal: true });
        try {
            const avatar = await window.electron.getURL('logo_circle.png');
            const headerImage = await window.electron.getURL('image_header.png');
            const headerImage_en = await window.electron.getURL('image_header_en.png')
            const language: string = localStorage.getItem("mcLanguage") || i18n.language;

            const imageSetting: any = {
                id: new Date().getTime(), //id是Date()
                name: "MiX Copilot",
                header: {
                    showHeader: true,
                    headerImage: language == "zh-CN" ? headerImage : headerImage_en,
                },
                container: {},
                footer: {
                    showFooter: true,
                    showQrCode: true,
                    showBrand: true,
                },
                avatar: avatar,
                nickname: "MiX Copilot",
                background: {
                    backgroundColor: "#4158D0",
                    backgroundImage: "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                },
                strong: {
                    template: "bold",
                    color: "#3F7B7C",
                    themeColor: "#3F7B7C",
                    weight: "bold",
                    padding: "0px",
                    textDecoration: "none",
                    marginBottom: "0px",
                },
                card: {
                    isGlassmorphism: false,
                    hasShadow: false,
                    opacity: 1,
                    blur: 10,
                    backgroundColor: "#FFFFFF",
                    textColor: "#000000",
                    borderRadius: 10,
                    padding: 10,
                    width: 240,
                    verticalSpacing: 20
                },
            };

            const imageList = [...this.state.imageList, imageSetting];
            this.setState({
                imageList: imageList,
                editedImage: imageSetting
            });

            //从imageList数组中剔除id是0的元素
            const imageList2Save = imageList.filter((item) => item.id !== 0);
            await window.electron.updateMyShareImagesConfig(imageList2Save);
        } catch (error) {
            console.error("Error fetching avatar URL:", error);
        }
    };


    render() {
        const isSubscribeVip = this._isSubscribeVip()
        console.log("isSubscribeVip", isSubscribeVip)
        console.log("imageList", this.state.imageList)

        return (
            <>
                <Space direction={"horizontal"}
                    style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <Title level={4} style={{ marginTop: 0, marginBottom: 10, color: "#000000" }}>
                        <>
                            {i18n.t('Image Share Setting')}
                            {/* {
                                !isSubscribeVip &&
                                <Popover placement={"right"}
                                         content={i18n.t('Only modifiable after subscribing to the product')}>
                                    <QuestionCircleTwoTone style={{marginLeft: 10}}/>
                                </Popover>
                            } */}
                        </>

                    </Title>
                    <Button type={"primary"} onClick={() => this.AddImage()}>{i18n.t('Add')}</Button>
                </Space>

                {this.state.imageList?.map((item: any) => (
                    <div key={item.id} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 10,
                        alignItems: "center"
                    }}>
                        <Text style={{ marginRight: 10 }}>{item.name}</Text>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Button disabled={item.id === 0}
                                onClick={() => this.OpenModal(item)}>{i18n.t('modify')}</Button>
                            <Button type={"text"} style={{ marginLeft: 10 }}
                                disabled={item.id === 0}
                                icon={<DeleteOutlined style={{ color: "gray" }} />}
                                onClick={() => this.deleteImage(item)} />
                        </div>
                    </div>
                ))}

                <Modal open={this.state.isShowModal} footer={null} width={800} centered={true}
                    onCancel={() => this.setState({ isShowModal: false })}>
                    {this.state.editedImage && this.ModalRender()}
                </Modal>
            </>
        )
    }

}

export default ShareImageSetting;
