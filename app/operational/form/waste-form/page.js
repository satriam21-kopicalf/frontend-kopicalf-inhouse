'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WasteFormPage;
var react_1 = require("react");
var Layout_1 = require("@/components/Layout");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var dayjs_1 = require("dayjs");
// Components
var ProductSelector_1 = require("@/components/operational/ProductSelector");
var ApprovalModal_1 = require("@/components/operational/ApprovalModal");
var AuditTrail_1 = require("@/components/operational/AuditTrail");
var PhotoUpload_1 = require("@/components/operational/PhotoUpload");
// API Service
var waste_form_1 = require("@/services/operational/waste-form");
var Title = antd_1.Typography.Title, Text = antd_1.Typography.Text;
var API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
// Use API or mock based on environment
var USE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true';
// Mock data
var MOCK_WASTE = [
    {
        id: 1,
        branch_id: 1,
        branch_code: 'KC-CPT',
        branch_name: 'Kopi Calf Cipete',
        branch_type: 'OUTLET',
        waste_date: '2026-09-15',
        waste_type: 'damaged',
        status: 'approved',
        total_value: 125000,
        total_items: 3,
        approved_by: 'Admin',
        approved_at: '2026-09-16T10:00:00Z',
        notes: 'Barang rusak saat pengiriman'
    },
    {
        id: 2,
        branch_id: 2,
        branch_code: 'KC-BDG',
        branch_name: 'Kopi Calf Bandung',
        branch_type: 'OUTLET',
        waste_date: '2026-09-10',
        waste_type: 'expired',
        status: 'submitted',
        total_value: 450000,
        total_items: 8,
        notes: 'Produk melewati tanggal kadaluarsa'
    },
    {
        id: 3,
        branch_id: 3,
        branch_code: 'KC-SBY',
        branch_name: 'Kopi Calf Surabaya',
        branch_type: 'OUTLET',
        waste_date: '2026-09-05',
        waste_type: 'lost',
        status: 'draft',
        total_value: 75000,
        total_items: 2,
        notes: 'Barang hilang saat stock opname'
    },
    {
        id: 4,
        branch_id: 1,
        branch_code: 'KC-CPT',
        branch_name: 'Kopi Calf Cipete',
        branch_type: 'OUTLET',
        waste_date: '2026-09-01',
        waste_type: 'damaged',
        status: 'rejected',
        total_value: 25000,
        total_items: 1,
        notes: 'Tidak ada foto dokumentasi'
    }
];
var MOCK_BRANCHES = [
    { id: 1, branch_code: 'KC-CPT', branch_name: 'Kopi Calf Cipete', branch_type: 'OUTLET' },
    { id: 2, branch_code: 'KC-BDG', branch_name: 'Kopi Calf Bandung', branch_type: 'OUTLET' },
    { id: 3, branch_code: 'KC-SBY', branch_name: 'Kopi Calf Surabaya', branch_type: 'OUTLET' },
    { id: 4, branch_code: 'HUB-WH', branch_name: 'Hub Warehouse', branch_type: 'HUB WH' },
    { id: 5, branch_code: 'HUB-CK', branch_name: 'Hub Center Kitchen', branch_type: 'HUB CK' }
];
var WASTE_TYPES = [
    { value: 'damaged', label: 'Rusak (Damaged)' },
    { value: 'expired', label: 'Kadaluarsa (Expired)' },
    { value: 'lost', label: 'Hilang (Lost/Missing)' },
    { value: 'contaminated', label: 'Kontaminasi (Contaminated)' },
    { value: 'other', label: 'Lainnya (Other)' }
];
var WASTE_REASONS = {
    damaged: ['Mishandling', 'Packaging Rusak', 'Produksi Cacat', 'Kerusakan Transport', 'Lainnya'],
    expired: ['Melewati Expired Date', 'Mendekati Expired Date', 'Sisa Batch Lama', 'Lainnya'],
    lost: ['Tidak Ditemukan Saat Opname', 'Pencurian', 'Error System', 'Lainnya'],
    contaminated: ['Kontaminasi Mikroba', 'Kontaminasi Kimia', 'Kontaminasi Fisik', 'Lainnya'],
    other: ['Quality Control', 'Produk Recall', 'Menu Discontinue', 'Lainnya']
};
// Status Badge Component
function StatusBadge(_a) {
    var status = _a.status;
    var config = {
        draft: { color: '#8A8A8A', bg: '#F5F5F5', icon: <icons_1.ClockCircleOutlined />, label: 'Draft' },
        submitted: { color: '#1890FF', bg: '#E6F7FF', icon: <icons_1.FileTextOutlined />, label: 'Submitted' },
        approved: { color: '#52C41A', bg: '#ECFDF5', icon: <icons_1.CheckCircleOutlined />, label: 'Approved' },
        rejected: { color: '#FF4D4F', bg: '#FFF1F0', icon: <icons_1.CloseCircleOutlined />, label: 'Rejected' }
    };
    var c = config[status] || config.draft;
    return (<antd_1.Tag icon={c.icon} style={{ color: c.color, background: c.bg, border: 'none', fontWeight: 500, borderRadius: 12, padding: '4px 12px' }}>
      {c.label}
    </antd_1.Tag>);
}
// Waste Type Badge
function WasteTypeBadge(_a) {
    var type = _a.type;
    var config = {
        damaged: { color: '#FF4D4F', bg: '#FFF1F0', label: 'Damaged' },
        expired: { color: '#FAAD14', bg: '#FFFBE6', label: 'Expired' },
        lost: { color: '#8A8A8A', bg: '#F5F5F5', label: 'Lost' },
        contaminated: { color: '#722ED1', bg: '#F9F0FF', label: 'Contaminated' },
        other: { color: '#1890FF', bg: '#E6F7FF', label: 'Other' }
    };
    var c = config[type] || config.other;
    return (<antd_1.Tag style={{ color: c.color, background: c.bg, border: 'none', fontWeight: 500, borderRadius: 12, padding: '4px 12px' }}>
      {c.label}
    </antd_1.Tag>);
}
// Summary Stats Component
function SummaryStats(_a) {
    var data = _a.data;
    return (<antd_1.Row gutter={16} style={{ marginBottom: 16 }}>
      <antd_1.Col span={4}>
        <antd_1.Card size="small" style={{ borderRadius: 8 }}>
          <antd_1.Statistic title={<Text style={{ fontSize: 11, color: '#8A8A8A' }}>Total</Text>} value={data.total} valueStyle={{ fontSize: 20, fontWeight: 600 }}/>
        </antd_1.Card>
      </antd_1.Col>
      <antd_1.Col span={4}>
        <antd_1.Card size="small" style={{ borderRadius: 8 }}>
          <antd_1.Statistic title={<Text style={{ fontSize: 11, color: '#8A8A8A' }}>Draft</Text>} value={data.draft} valueStyle={{ fontSize: 20, fontWeight: 600, color: '#8A8A8A' }}/>
        </antd_1.Card>
      </antd_1.Col>
      <antd_1.Col span={4}>
        <antd_1.Card size="small" style={{ borderRadius: 8 }}>
          <antd_1.Statistic title={<Text style={{ fontSize: 11, color: '#8A8A8A' }}>Submitted</Text>} value={data.submitted} valueStyle={{ fontSize: 20, fontWeight: 600, color: '#1890FF' }}/>
        </antd_1.Card>
      </antd_1.Col>
      <antd_1.Col span={4}>
        <antd_1.Card size="small" style={{ borderRadius: 8 }}>
          <antd_1.Statistic title={<Text style={{ fontSize: 11, color: '#8A8A8A' }}>Approved</Text>} value={data.approved} valueStyle={{ fontSize: 20, fontWeight: 600, color: '#52C41A' }}/>
        </antd_1.Card>
      </antd_1.Col>
      <antd_1.Col span={4}>
        <antd_1.Card size="small" style={{ borderRadius: 8 }}>
          <antd_1.Statistic title={<Text style={{ fontSize: 11, color: '#8A8A8A' }}>Rejected</Text>} value={data.rejected} valueStyle={{ fontSize: 20, fontWeight: 600, color: '#FF4D4F' }}/>
        </antd_1.Card>
      </antd_1.Col>
      <antd_1.Col span={4}>
        <antd_1.Card size="small" style={{ borderRadius: 8 }}>
          <antd_1.Statistic title={<Text style={{ fontSize: 11, color: '#8A8A8A' }}>Total Value</Text>} value={data.totalValue} precision={0} prefix="Rp" valueStyle={{ fontSize: 20, fontWeight: 600, color: '#FF4D4F' }}/>
        </antd_1.Card>
      </antd_1.Col>
    </antd_1.Row>);
}
function WasteFormPage() {
    var _this = this;
    var _a;
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), submitting = _c[0], setSubmitting = _c[1];
    var _d = (0, react_1.useState)([]), wastes = _d[0], setWastes = _d[1];
    var _e = (0, react_1.useState)(MOCK_BRANCHES), branches = _e[0], setBranches = _e[1];
    var _f = (0, react_1.useState)(false), drawerOpen = _f[0], setDrawerOpen = _f[1];
    var _g = (0, react_1.useState)(false), detailOpen = _g[0], setDetailOpen = _g[1];
    var _h = (0, react_1.useState)(null), selectedWaste = _h[0], setSelectedWaste = _h[1];
    var _j = (0, react_1.useState)(null), editingWaste = _j[0], setEditingWaste = _j[1];
    var _k = (0, react_1.useState)([]), details = _k[0], setDetails = _k[1];
    var _l = (0, react_1.useState)({}), itemPhotos = _l[0], setItemPhotos = _l[1];
    var _m = (0, react_1.useState)(''), search = _m[0], setSearch = _m[1];
    var _o = (0, react_1.useState)(), statusFilter = _o[0], setStatusFilter = _o[1];
    var _p = (0, react_1.useState)(), wasteTypeFilter = _p[0], setWasteTypeFilter = _p[1];
    var _q = (0, react_1.useState)(), branchFilter = _q[0], setBranchFilter = _q[1];
    var _r = (0, react_1.useState)(1), page = _r[0], setPage = _r[1];
    var pageSize = (0, react_1.useState)(10)[0];
    var form = antd_1.Form.useForm()[0];
    var detailForm = antd_1.Form.useForm()[0];
    // Modal states
    var _s = (0, react_1.useState)(false), productSelectorOpen = _s[0], setProductSelectorOpen = _s[1];
    var _t = (0, react_1.useState)(false), approvalModalOpen = _t[0], setApprovalModalOpen = _t[1];
    var _u = (0, react_1.useState)('approve'), approvalAction = _u[0], setApprovalAction = _u[1];
    // Summary stats
    var summaryStats = {
        total: wastes.length,
        draft: wastes.filter(function (w) { return w.status === 'draft'; }).length,
        submitted: wastes.filter(function (w) { return w.status === 'submitted'; }).length,
        approved: wastes.filter(function (w) { return w.status === 'approved'; }).length,
        rejected: wastes.filter(function (w) { return w.status === 'rejected'; }).length,
        totalValue: wastes.reduce(function (acc, w) { return acc + w.total_value; }, 0)
    };
    // Fetch data from API
    var fetchWastes = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var filter, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    if (!USE_API) return [3 /*break*/, 3];
                    filter = {
                        page: page,
                        page_size: pageSize,
                        branch_id: branchFilter,
                        status: statusFilter,
                        waste_type: wasteTypeFilter,
                    };
                    return [4 /*yield*/, waste_form_1.default.getList(filter)];
                case 2:
                    data = _a.sent();
                    setWastes(data);
                    return [3 /*break*/, 4];
                case 3:
                    // Use mock data
                    setWastes(MOCK_WASTE);
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error('Failed to fetch waste forms:', error_1);
                    antd_1.message.error('Gagal mengambil data Waste Form');
                    // Fallback to mock data
                    setWastes(MOCK_WASTE);
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [page, pageSize, branchFilter, statusFilter, wasteTypeFilter]);
    (0, react_1.useEffect)(function () {
        fetchWastes();
    }, [fetchWastes]);
    // Fetch branches
    (0, react_1.useEffect)(function () {
        var fetchBranches = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!USE_API) return [3 /*break*/, 6];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        setBranches(data);
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        console.error('Failed to fetch branches:', error_2);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        fetchBranches();
    }, []);
    var filteredWastes = wastes.filter(function (w) {
        var _a, _b;
        var matchSearch = !search ||
            ((_a = w.branch_name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase())) ||
            ((_b = w.branch_code) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase()));
        var matchStatus = !statusFilter || w.status === statusFilter;
        var matchType = !wasteTypeFilter || w.waste_type === wasteTypeFilter;
        var matchBranch = !branchFilter || w.branch_id === branchFilter;
        return matchSearch && matchStatus && matchType && matchBranch;
    });
    var handleView = function (record) { return __awaiter(_this, void 0, void 0, function () {
        var data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSelectedWaste(record);
                    setDetailOpen(true);
                    if (!USE_API) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, waste_form_1.default.getDetail(record.id)];
                case 2:
                    data = _a.sent();
                    setSelectedWaste(__assign(__assign({}, record), data));
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Failed to fetch details:', error_3);
                    antd_1.message.error('Gagal mengambil detail Waste Form');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleEdit = function (record) {
        if (record.status !== 'draft' && record.status !== 'rejected') {
            antd_1.message.warning('Hanya data dengan status Draft atau Rejected yang dapat diedit');
            return;
        }
        setEditingWaste(record);
        form.setFieldsValue({
            branch_id: record.branch_id,
            waste_date: (0, dayjs_1.default)(record.waste_date),
            waste_type: record.waste_type,
            notes: record.notes
        });
        // Load existing details with photos
        if (record.details) {
            setDetails(record.details);
            var photos_1 = {};
            record.details.forEach(function (d) {
                if (d.photo_urls) {
                    photos_1[d.product_id] = d.photo_urls;
                }
            });
            setItemPhotos(photos_1);
        }
        else {
            setDetails([]);
            setItemPhotos({});
        }
        setDrawerOpen(true);
    };
    var handleDelete = function (record) { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (record.status !== 'draft' && record.status !== 'rejected') {
                        antd_1.message.warning('Hanya data dengan status Draft atau Rejected yang dapat dihapus');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    if (!USE_API) return [3 /*break*/, 3];
                    return [4 /*yield*/, waste_form_1.default.delete(record.id)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    setWastes(wastes.filter(function (w) { return w.id !== record.id; }));
                    antd_1.message.success('Waste Form berhasil dihapus');
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    console.error('Failed to delete:', error_4);
                    antd_1.message.error('Gagal menghapus Waste Form');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleAddNew = function () {
        setEditingWaste(null);
        form.resetFields();
        setDetails([]);
        setItemPhotos({});
        setDrawerOpen(true);
    };
    var handleSubmit = function (record) { return __awaiter(_this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    if (!USE_API) return [3 /*break*/, 3];
                    return [4 /*yield*/, waste_form_1.default.submit(record.id)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    setWastes(wastes.map(function (w) {
                        return w.id === record.id ? __assign(__assign({}, w), { status: 'submitted' }) : w;
                    }));
                    antd_1.message.success('Waste Form berhasil disubmit');
                    return [3 /*break*/, 6];
                case 4:
                    error_5 = _a.sent();
                    console.error('Failed to submit:', error_5);
                    antd_1.message.error('Gagal submit Waste Form');
                    return [3 /*break*/, 6];
                case 5:
                    setSubmitting(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleApprove = function (record, approved) { return __awaiter(_this, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    if (!USE_API) return [3 /*break*/, 3];
                    return [4 /*yield*/, waste_form_1.default.approve(record.id, approved)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    setWastes(wastes.map(function (w) {
                        return w.id === record.id ? __assign(__assign({}, w), { status: (approved ? 'approved' : 'rejected'), approved_by: 'Current User', approved_at: new Date().toISOString() }) : w;
                    }));
                    antd_1.message.success("Waste Form berhasil ".concat(approved ? 'disetujui' : 'ditolak'));
                    setDetailOpen(false);
                    return [3 /*break*/, 6];
                case 4:
                    error_6 = _a.sent();
                    console.error('Failed to approve:', error_6);
                    antd_1.message.error('Gagal approval Waste Form');
                    return [3 /*break*/, 6];
                case 5:
                    setSubmitting(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDrawerSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var values_1, wasteData_1, result, newWaste, error_7;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, form.validateFields()];
                case 1:
                    values_1 = _c.sent();
                    wasteData_1 = {
                        branch_id: values_1.branch_id,
                        waste_date: values_1.waste_date.format('YYYY-MM-DD'),
                        waste_type: values_1.waste_type,
                        notes: values_1.notes,
                        details: details.map(function (d) { return ({
                            product_id: d.product_id,
                            product_code: d.product_code,
                            qty: d.qty,
                            unit_cost: d.unit_cost,
                            waste_reason: d.waste_reason,
                            photo_urls: itemPhotos[d.product_id] || []
                        }); })
                    };
                    if (!editingWaste) return [3 /*break*/, 4];
                    if (!USE_API) return [3 /*break*/, 3];
                    return [4 /*yield*/, waste_form_1.default.update(editingWaste.id, wasteData_1)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    setWastes(wastes.map(function (w) {
                        return w.id === editingWaste.id ? __assign(__assign(__assign({}, w), values_1), { waste_date: values_1.waste_date.format('YYYY-MM-DD'), total_items: details.length, total_value: details.reduce(function (acc, d) { return acc + (d.total_cost || 0); }, 0), details: wasteData_1.details }) : w;
                    }));
                    antd_1.message.success('Waste Form berhasil diupdate');
                    return [3 /*break*/, 8];
                case 4:
                    if (!USE_API) return [3 /*break*/, 6];
                    return [4 /*yield*/, waste_form_1.default.create(wasteData_1)];
                case 5:
                    result = _c.sent();
                    setWastes(__spreadArray([result], wastes, true));
                    return [3 /*break*/, 7];
                case 6:
                    newWaste = {
                        id: Math.max.apply(Math, __spreadArray(__spreadArray([], wastes.map(function (w) { return w.id; }), false), [0], false)) + 1,
                        branch_id: values_1.branch_id,
                        branch_code: (_a = branches.find(function (b) { return b.id === values_1.branch_id; })) === null || _a === void 0 ? void 0 : _a.branch_code,
                        branch_name: (_b = branches.find(function (b) { return b.id === values_1.branch_id; })) === null || _b === void 0 ? void 0 : _b.branch_name,
                        waste_date: values_1.waste_date.format('YYYY-MM-DD'),
                        waste_type: values_1.waste_type,
                        status: 'draft',
                        total_value: details.reduce(function (acc, d) { return acc + (d.total_cost || 0); }, 0),
                        total_items: details.length,
                        notes: values_1.notes,
                        details: wasteData_1.details
                    };
                    setWastes(__spreadArray([newWaste], wastes, true));
                    _c.label = 7;
                case 7:
                    antd_1.message.success('Waste Form berhasil dibuat');
                    _c.label = 8;
                case 8:
                    setDrawerOpen(false);
                    setItemPhotos({});
                    return [3 /*break*/, 10];
                case 9:
                    error_7 = _c.sent();
                    console.error('Failed to save:', error_7);
                    antd_1.message.error('Gagal menyimpan Waste Form');
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    var handleAddDetail = function () {
        detailForm.validateFields().then(function (values) {
            var newDetail = {
                product_id: Date.now(),
                product_code: values.product_code,
                product_name: values.product_name,
                qty: values.qty || 1,
                unit_cost: values.unit_cost || 0,
                waste_reason: values.waste_reason
            };
            newDetail.total_cost = newDetail.qty * newDetail.unit_cost;
            setDetails(__spreadArray(__spreadArray([], details, true), [newDetail], false));
            detailForm.resetFields();
            antd_1.message.success('Item berhasil ditambahkan');
        });
    };
    var handleRemoveDetail = function (index) {
        setDetails(details.filter(function (_, i) { return i !== index; }));
    };
    // Product Selector Handler
    var handleOpenProductSelector = function () {
        var branchId = form.getFieldValue('branch_id');
        if (!branchId) {
            antd_1.message.warning('Pilih Branch terlebih dahulu');
            return;
        }
        setProductSelectorOpen(true);
    };
    var handleSelectProduct = function (product) {
        var newDetail = {
            product_id: product.product_id,
            product_code: product.product_code,
            product_name: product.product_name,
            uom_name: product.uom_name,
            qty: 1,
            unit_cost: product.unit_cost || 0,
            total_cost: product.unit_cost || 0
        };
        setDetails(__spreadArray(__spreadArray([], details, true), [newDetail], false));
        antd_1.message.success("Produk ".concat(product.product_name, " ditambahkan"));
    };
    // Approval Handlers
    var handleOpenApproval = function (action) {
        setApprovalAction(action);
        setApprovalModalOpen(true);
    };
    var handleApprovalConfirm = function (notes) {
        if (selectedWaste) {
            setWastes(wastes.map(function (w) {
                return w.id === selectedWaste.id ? __assign(__assign({}, w), { status: (approvalAction === 'approve' ? 'approved' : 'rejected'), approved_by: 'Current User', approved_at: new Date().toISOString() }) : w;
            }));
            antd_1.message.success("Waste Form berhasil ".concat(approvalAction === 'approve' ? 'disetujui' : 'ditolak'));
        }
        setApprovalModalOpen(false);
        setDetailOpen(false);
    };
    var handleRejectReason = function (reason) {
        if (selectedWaste) {
            setWastes(wastes.map(function (w) {
                return w.id === selectedWaste.id ? __assign(__assign({}, w), { status: 'rejected', approved_by: 'Current User', approved_at: new Date().toISOString(), notes: w.notes ? "".concat(w.notes, "\n[Rejected: ").concat(reason, "]") : "[Rejected: ".concat(reason, "]") }) : w;
            }));
            antd_1.message.success('Waste Form berhasil ditolak');
        }
        setApprovalModalOpen(false);
        setDetailOpen(false);
    };
    // Print Handler
    var handlePrint = (0, react_1.useCallback)(function (record) {
        var printContent = "\n      <h1>Waste Form Report</h1>\n      <p><strong>Branch:</strong> ".concat(record.branch_name, " (").concat(record.branch_code, ")</p>\n      <p><strong>Date:</strong> ").concat((0, dayjs_1.default)(record.waste_date).format('DD MMMM YYYY'), "</p>\n      <p><strong>Waste Type:</strong> ").concat(record.waste_type.toUpperCase(), "</p>\n      <p><strong>Status:</strong> ").concat(record.status.toUpperCase(), "</p>\n      <hr/>\n      <p><strong>Total Items:</strong> ").concat(record.total_items, "</p>\n      <p><strong>Total Waste Value:</strong> Rp ").concat(record.total_value.toLocaleString('id-ID'), "</p>\n    ");
        var printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        }
    }, []);
    var columns = [
        {
            title: 'Branch',
            dataIndex: 'branch_name',
            key: 'branch_name',
            render: function (text, record) { return (<div>
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.branch_code} - {record.branch_type}</Text>
        </div>); }
        },
        {
            title: 'Tanggal',
            dataIndex: 'waste_date',
            key: 'waste_date',
            width: 110,
            render: function (date) { return (0, dayjs_1.default)(date).format('DD MMM YYYY'); }
        },
        {
            title: 'Tipe Waste',
            dataIndex: 'waste_type',
            key: 'waste_type',
            width: 130,
            render: function (type) { return <WasteTypeBadge type={type}/>; }
        },
        {
            title: 'Items',
            dataIndex: 'total_items',
            key: 'total_items',
            width: 80,
            align: 'center'
        },
        {
            title: 'Total Value',
            dataIndex: 'total_value',
            key: 'total_value',
            width: 130,
            align: 'right',
            render: function (value) { return (<Text style={{ color: '#FF4D4F', fontWeight: 600 }}>
          -{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)}
        </Text>); }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: function (status) { return <StatusBadge status={status}/>; }
        },
        {
            title: 'Action',
            key: 'action',
            width: 160,
            render: function (_, record) { return (<antd_1.Space size="small">
          <antd_1.Button type="text" size="small" icon={<icons_1.EyeOutlined />} onClick={function () { return handleView(record); }}/>
          <antd_1.Button type="text" size="small" icon={<icons_1.PrinterOutlined />} onClick={function () { return handlePrint(record); }} title="Print"/>
          {(record.status === 'draft' || record.status === 'rejected') && (<antd_1.Button type="text" size="small" icon={<icons_1.EditOutlined />} onClick={function () { return handleEdit(record); }}/>)}
          {record.status === 'draft' && (<antd_1.Button type="text" size="small" onClick={function () { return handleSubmit(record); }} style={{ color: '#1890FF' }}>
              Submit
            </antd_1.Button>)}
          {(record.status === 'draft' || record.status === 'rejected') && (<antd_1.Popconfirm title="Hapus Waste Form ini?" onConfirm={function () { return handleDelete(record); }} okText="Ya" cancelText="Batal">
              <antd_1.Button type="text" size="small" danger icon={<icons_1.DeleteOutlined />}/>
            </antd_1.Popconfirm>)}
        </antd_1.Space>); }
        }
    ];
    var detailColumns = [
        {
            title: 'Photo',
            key: 'photo',
            width: 80,
            render: function (_, record) { return (record.photo_urls && record.photo_urls.length > 0 ? (<antd_1.Image.PreviewGroup>
            <antd_1.Image src={record.photo_urls[0]} alt="Waste" width={40} height={40} style={{ objectFit: 'cover', borderRadius: 4 }}/>
          </antd_1.Image.PreviewGroup>) : (<Text type="secondary">-</Text>)); }
        },
        {
            title: 'Product Code',
            dataIndex: 'product_code',
            key: 'product_code',
            width: 120
        },
        {
            title: 'Product Name',
            dataIndex: 'product_name',
            key: 'product_name'
        },
        {
            title: 'Qty',
            dataIndex: 'qty',
            key: 'qty',
            width: 80,
            align: 'right'
        },
        {
            title: 'Unit Cost',
            dataIndex: 'unit_cost',
            key: 'unit_cost',
            width: 100,
            align: 'right',
            render: function (val) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val); }
        },
        {
            title: 'Total Cost',
            dataIndex: 'total_cost',
            key: 'total_cost',
            width: 120,
            align: 'right',
            render: function (val) { return (<Text style={{ color: '#FF4D4F', fontWeight: 600 }}>
          -{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0)}
        </Text>); }
        },
        {
            title: 'Waste Reason',
            dataIndex: 'waste_reason',
            key: 'waste_reason',
            width: 150
        }
    ];
    return (<Layout_1.default>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ color: '#000000', marginBottom: 2, fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em' }}>
            Waste Form
          </Title>
          <Text style={{ color: '#8A8A8A', fontSize: 13 }}>
            Formulir pencatatan barang yang di-waste (rusak, kadaluarsa, hilang)
          </Text>
        </div>
        <antd_1.Button type="primary" icon={<icons_1.PlusOutlined />} onClick={handleAddNew} style={{ borderRadius: 8 }}>
          Tambah Waste Form
        </antd_1.Button>
      </div>

      <SummaryStats data={summaryStats}/>

      <div style={{
            background: '#FFFFFF',
            borderRadius: 8,
            border: '1px solid #E5E5E5',
            padding: 16
        }}>
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <antd_1.Input.Search placeholder="Cari branch..." onSearch={function (val) { return setSearch(val); }} onChange={function (e) { return setSearch(e.target.value); }} style={{ width: 250 }} allowClear/>
          <antd_1.Select placeholder="Filter Status" value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }} allowClear>
            <antd_1.Select.Option value="draft">Draft</antd_1.Select.Option>
            <antd_1.Select.Option value="submitted">Submitted</antd_1.Select.Option>
            <antd_1.Select.Option value="approved">Approved</antd_1.Select.Option>
            <antd_1.Select.Option value="rejected">Rejected</antd_1.Select.Option>
          </antd_1.Select>
          <antd_1.Select placeholder="Filter Tipe Waste" value={wasteTypeFilter} onChange={setWasteTypeFilter} style={{ width: 180 }} allowClear>
            {WASTE_TYPES.map(function (t) { return (<antd_1.Select.Option key={t.value} value={t.value}>{t.label}</antd_1.Select.Option>); })}
          </antd_1.Select>
          <antd_1.Select placeholder="Filter Branch" value={branchFilter} onChange={setBranchFilter} style={{ width: 200 }} allowClear>
            {branches.map(function (b) { return (<antd_1.Select.Option key={b.id} value={b.id}>{b.branch_name}</antd_1.Select.Option>); })}
          </antd_1.Select>
        </div>

        {/* Table */}
        <antd_1.Table columns={columns} dataSource={filteredWastes} loading={loading} rowKey="id" pagination={{
            current: page,
            pageSize: pageSize,
            total: filteredWastes.length,
            onChange: setPage,
            showSizeChanger: false
        }} locale={{ emptyText: <antd_1.Empty description="Tidak ada data Waste Form"/> }}/>
      </div>

      {/* Create/Edit Drawer */}
      <antd_1.Drawer title={editingWaste ? 'Edit Waste Form' : 'Tambah Waste Form'} placement="right" width={650} open={drawerOpen} onClose={function () { return setDrawerOpen(false); }} extra={<antd_1.Space>
            <antd_1.Button onClick={function () { return setDrawerOpen(false); }}>Batal</antd_1.Button>
            <antd_1.Button type="primary" onClick={handleDrawerSave}>
              {editingWaste ? 'Update' : 'Simpan'}
            </antd_1.Button>
          </antd_1.Space>}>
        <antd_1.Form form={form} layout="vertical">
          <antd_1.Form.Item name="branch_id" label="Branch" rules={[{ required: true, message: 'Branch wajib dipilih' }]}>
            <antd_1.Select placeholder="Pilih Branch" size="large">
              {branches.map(function (b) { return (<antd_1.Select.Option key={b.id} value={b.id}>
                  {b.branch_name} ({b.branch_code})
                </antd_1.Select.Option>); })}
            </antd_1.Select>
          </antd_1.Form.Item>

          <antd_1.Form.Item name="waste_date" label="Tanggal Waste" rules={[{ required: true, message: 'Tanggal wajib diisi' }]}>
            <antd_1.DatePicker style={{ width: '100%' }} size="large"/>
          </antd_1.Form.Item>

          <antd_1.Form.Item name="waste_type" label="Tipe Waste" rules={[{ required: true, message: 'Tipe waste wajib dipilih' }]}>
            <antd_1.Select placeholder="Pilih Tipe Waste" size="large">
              {WASTE_TYPES.map(function (t) { return (<antd_1.Select.Option key={t.value} value={t.value}>{t.label}</antd_1.Select.Option>); })}
            </antd_1.Select>
          </antd_1.Form.Item>

          <antd_1.Form.Item name="notes" label="Catatan">
            <antd_1.Input.TextArea rows={2} placeholder="Catatan tambahan (opsional)"/>
          </antd_1.Form.Item>

          {/* Items Section */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text strong style={{ fontSize: 14 }}>
                Item Waste
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Total: Rp {details.reduce(function (acc, d) { return acc + (d.total_cost || 0); }, 0).toLocaleString('id-ID')}
              </Text>
            </div>

            {/* Warning for certain types */}
            <div style={{
            background: '#FFFBE6',
            border: '1px solid #FAAD14',
            borderRadius: 6,
            padding: '8px 12px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8
        }}>
              <icons_1.WarningOutlined style={{ color: '#FAAD14' }}/>
              <Text style={{ fontSize: 12, color: '#8A6D3B' }}>
                Untuk tipe Expired dan Damaged, foto dokumentasi sangat disarankan sebagai bukti.
              </Text>
            </div>

            {/* Add Item Form */}
            <div style={{ background: '#F7F7F7', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Klik tombol di bawah untuk memilih produk dari daftar. Branch harus dipilih terlebih dahulu.
              </Text>
              <div style={{ marginTop: 8 }}>
                <antd_1.Button type="dashed" icon={<icons_1.PlusOutlined />} onClick={handleOpenProductSelector} style={{ width: '100%' }}>
                  Pilih Produk dari Daftar
                </antd_1.Button>
              </div>
            </div>

            {/* Items Table */}
            {details.length > 0 ? (<>
                {details.map(function (d, i) {
                var _a;
                return (<div key={i} style={{ marginBottom: 12, background: '#FAFAFA', borderRadius: 8, padding: 12, border: '1px solid #E8E8E8' }}>
                    <antd_1.Row gutter={12} align="middle">
                      <antd_1.Col flex="none">
                        <div style={{ background: '#FFF', borderRadius: 8, padding: 8, border: '1px solid #E8E8E8' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Item {i + 1}</Text>
                          <br />
                          <Text strong style={{ fontSize: 13 }}>{d.product_code}</Text>
                          <br />
                          <Text style={{ fontSize: 12 }}>{d.product_name}</Text>
                        </div>
                      </antd_1.Col>
                      <antd_1.Col flex="none">
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Qty</Text>
                          <br />
                          <antd_1.InputNumber size="small" min={1} value={d.qty} onChange={function (val) {
                        var newDetails = __spreadArray([], details, true);
                        newDetails[i] = __assign(__assign({}, newDetails[i]), { qty: val || 1 });
                        newDetails[i].total_cost = (val || 1) * newDetails[i].unit_cost;
                        setDetails(newDetails);
                    }} style={{ width: 60 }}/>
                        </div>
                      </antd_1.Col>
                      <antd_1.Col flex="none">
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Cost</Text>
                          <br />
                          <Text strong style={{ color: '#FF4D4F' }}>
                            Rp {(d.total_cost || 0).toLocaleString('id-ID')}
                          </Text>
                        </div>
                      </antd_1.Col>
                      <antd_1.Col flex="none">
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Alasan</Text>
                          <br />
                          <antd_1.Select size="small" value={d.waste_reason} onChange={function (val) {
                        var newDetails = __spreadArray([], details, true);
                        newDetails[i] = __assign(__assign({}, newDetails[i]), { waste_reason: val });
                        setDetails(newDetails);
                    }} style={{ width: 120 }}>
                            {(WASTE_REASONS[form.getFieldValue('waste_type')] || WASTE_REASONS.damaged).map(function (r) { return (<antd_1.Select.Option key={r} value={r}>{r}</antd_1.Select.Option>); })}
                          </antd_1.Select>
                        </div>
                      </antd_1.Col>
                      <antd_1.Col flex={1}>
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Foto ({((_a = itemPhotos[d.product_id]) === null || _a === void 0 ? void 0 : _a.length) || 0})</Text>
                          <br />
                          <PhotoUpload_1.default value={itemPhotos[d.product_id] || []} onChange={function (urls) {
                        var _a;
                        setItemPhotos(__assign(__assign({}, itemPhotos), (_a = {}, _a[d.product_id] = urls, _a)));
                        var newDetails = __spreadArray([], details, true);
                        newDetails[i] = __assign(__assign({}, newDetails[i]), { photo_urls: urls });
                        setDetails(newDetails);
                    }} maxCount={5} wasteType={form.getFieldValue('waste_type')}/>
                        </div>
                      </antd_1.Col>
                      <antd_1.Col flex="none">
                        <antd_1.Button type="text" danger size="small" onClick={function () {
                        setDetails(details.filter(function (_, idx) { return idx !== i; }));
                        var newPhotos = __assign({}, itemPhotos);
                        delete newPhotos[d.product_id];
                        setItemPhotos(newPhotos);
                    }}>
                          Remove
                        </antd_1.Button>
                      </antd_1.Col>
                    </antd_1.Row>
                  </div>);
            })}
                <div style={{ marginTop: 16, padding: 12, background: '#FFF1F0', borderRadius: 8, border: '1px solid #FFCCC7' }}>
                  <antd_1.Row gutter={16} align="middle">
                    <antd_1.Col span={12}>
                      <antd_1.Statistic title="Total Items" value={details.length} valueStyle={{ fontSize: 18 }}/>
                    </antd_1.Col>
                    <antd_1.Col span={12}>
                      <antd_1.Statistic title="Total Waste Value" value={details.reduce(function (acc, d) { return acc + (d.total_cost || 0); }, 0)} precision={0} prefix="Rp" suffix=" (kerugian)" valueStyle={{ fontSize: 20, color: '#FF4D4F', fontWeight: 700 }}/>
                    </antd_1.Col>
                  </antd_1.Row>
                </div>
              </>) : (<antd_1.Empty description="Belum ada item ditambahkan" image={antd_1.Empty.PRESENTED_IMAGE_SIMPLE}/>)}
          </div>
        </antd_1.Form>
      </antd_1.Drawer>

      {/* Detail Drawer */}
      <antd_1.Drawer title="Detail Waste Form" placement="right" width={700} open={detailOpen} onClose={function () { return setDetailOpen(false); }} extra={(selectedWaste === null || selectedWaste === void 0 ? void 0 : selectedWaste.status) === 'submitted' && (<antd_1.Space>
              <antd_1.Button danger onClick={function () { return handleOpenApproval('reject'); }}>
                Tolak
              </antd_1.Button>
              <antd_1.Button type="primary" onClick={function () { return handleOpenApproval('approve'); }}>
                Setujui
              </antd_1.Button>
            </antd_1.Space>)}>
        {selectedWaste && (<>
            <div style={{ marginBottom: 16 }}>
              <antd_1.Row gutter={16}>
                <antd_1.Col span={12}>
                  <Text type="secondary">Branch</Text>
                  <br />
                  <Text strong>{selectedWaste.branch_name}</Text>
                  <br />
                  <Text type="secondary">{selectedWaste.branch_code} - {selectedWaste.branch_type}</Text>
                </antd_1.Col>
                <antd_1.Col span={12}>
                  <Text type="secondary">Tanggal</Text>
                  <br />
                  <Text strong>{(0, dayjs_1.default)(selectedWaste.waste_date).format('DD MMMM YYYY')}</Text>
                </antd_1.Col>
              </antd_1.Row>
              <antd_1.Row gutter={16} style={{ marginTop: 16 }}>
                <antd_1.Col span={8}>
                  <Text type="secondary">Tipe Waste</Text>
                  <br />
                  <WasteTypeBadge type={selectedWaste.waste_type}/>
                </antd_1.Col>
                <antd_1.Col span={8}>
                  <Text type="secondary">Total Items</Text>
                  <br />
                  <Text strong>{selectedWaste.total_items} item(s)</Text>
                </antd_1.Col>
                <antd_1.Col span={8}>
                  <Text type="secondary">Status</Text>
                  <br />
                  <StatusBadge status={selectedWaste.status}/>
                </antd_1.Col>
              </antd_1.Row>
              {selectedWaste.notes && (<div style={{ marginTop: 16 }}>
                  <Text type="secondary">Catatan</Text>
                  <br />
                  <Text>{selectedWaste.notes}</Text>
                </div>)}
              {selectedWaste.approved_by && (<div style={{ marginTop: 16 }}>
                  <Text type="secondary">Disetujui oleh</Text>
                  <br />
                  <Text strong>{selectedWaste.approved_by}</Text>
                  {selectedWaste.approved_at && (<Text type="secondary"> pada {(0, dayjs_1.default)(selectedWaste.approved_at).format('DD MMM YYYY HH:mm')}</Text>)}
                </div>)}
            </div>

            <antd_1.Divider style={{ margin: '16px 0' }}/>

            {/* Items with Photos */}
            {(_a = selectedWaste.details) === null || _a === void 0 ? void 0 : _a.map(function (detail, idx) { return (<div key={idx} style={{
                    marginBottom: 12,
                    background: '#FAFAFA',
                    borderRadius: 8,
                    padding: 12,
                    border: '1px solid #E8E8E8'
                }}>
                <antd_1.Row gutter={12}>
                  <antd_1.Col span={12}>
                    <Text strong style={{ fontSize: 13 }}>{detail.product_name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{detail.product_code}</Text>
                  </antd_1.Col>
                  <antd_1.Col span={4}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Qty</Text>
                    <br />
                    <Text>{detail.qty}</Text>
                  </antd_1.Col>
                  <antd_1.Col span={4}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Total Cost</Text>
                    <br />
                    <Text style={{ color: '#FF4D4F', fontWeight: 600 }}>
                      -{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(detail.total_cost || 0)}
                    </Text>
                  </antd_1.Col>
                  <antd_1.Col span={4}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Alasan</Text>
                    <br />
                    <antd_1.Tag color="orange">{detail.waste_reason}</antd_1.Tag>
                  </antd_1.Col>
                </antd_1.Row>
                {detail.photo_urls && detail.photo_urls.length > 0 && (<div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Foto Dokumentasi:</Text>
                    <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {detail.photo_urls.map(function (url, photoIdx) { return (<antd_1.Image.PreviewGroup key={photoIdx}>
                          <antd_1.Image src={url} alt={"Photo ".concat(photoIdx + 1)} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #E8E8E8' }}/>
                        </antd_1.Image.PreviewGroup>); })}
                    </div>
                  </div>)}
              </div>); })}

            {/* Fallback if no details */}
            {!selectedWaste.details && (<antd_1.Table columns={detailColumns} dataSource={[
                    { id: 1, product_id: 1, product_code: 'COF001', product_name: 'Biji Kopi Arabica Premium 250g', qty: 2, unit_cost: 45000, total_cost: 90000, waste_reason: 'Melewati Expired Date', photo_urls: [] },
                    { id: 2, product_id: 2, product_code: 'MIL001', product_name: 'UHT Milk 1000ml', qty: 3, unit_cost: 12000, total_cost: 36000, waste_reason: 'Packaging Rusak', photo_urls: [] },
                    { id: 3, product_id: 3, product_code: 'SYR001', product_name: 'Syrup Vanilla 700ml', qty: 1, unit_cost: 35000, total_cost: 35000, waste_reason: 'Kontaminasi', photo_urls: [] }
                ].map(function (d, i) { return (__assign(__assign({}, d), { key: i })); })} pagination={false} size="small"/>)}

            <div style={{ marginTop: 16, padding: 12, background: '#FFF1F0', borderRadius: 8, border: '1px solid #FFCCC7' }}>
              <antd_1.Row gutter={16}>
                <antd_1.Col span={8}>
                  <antd_1.Statistic title="Total Items" value={selectedWaste.total_items} valueStyle={{ fontSize: 18 }}/>
                </antd_1.Col>
                <antd_1.Col span={16}>
                  <antd_1.Statistic title="Total Waste Value" value={selectedWaste.total_value} precision={0} prefix="Rp" suffix=" (kerugian)" valueStyle={{ fontSize: 20, color: '#FF4D4F', fontWeight: 700 }}/>
                </antd_1.Col>
              </antd_1.Row>
            </div>

            <antd_1.Divider style={{ margin: '16px 0' }}/>

            {/* Audit Trail */}
            <AuditTrail_1.default entries={__spreadArray(__spreadArray([
                {
                    id: 1,
                    action: 'created',
                    performed_by: selectedWaste.created_by || 'System',
                    performed_at: selectedWaste.created_at || new Date().toISOString()
                }
            ], (selectedWaste.status !== 'draft' ? [{
                    id: 2,
                    action: 'submitted',
                    performed_by: selectedWaste.submitted_by || 'PIC',
                    performed_at: selectedWaste.submitted_at || new Date().toISOString()
                }] : []), true), (selectedWaste.status === 'approved' || selectedWaste.status === 'rejected' ? [{
                    id: 3,
                    action: selectedWaste.status,
                    performed_by: selectedWaste.approved_by || 'Manager',
                    performed_at: selectedWaste.approved_at || new Date().toISOString(),
                    notes: selectedWaste.approval_notes
                }] : []), true)}/>
          </>)}
      </antd_1.Drawer>

      {/* Product Selector Modal */}
      <ProductSelector_1.default open={productSelectorOpen} onClose={function () { return setProductSelectorOpen(false); }} onSelect={handleSelectProduct} branchId={form.getFieldValue('branch_id')} showCost={true} selectedProducts={details.map(function (d) { return d.product_id; })}/>

      {/* Approval Modal */}
      <ApprovalModal_1.default open={approvalModalOpen} onClose={function () { return setApprovalModalOpen(false); }} onApprove={handleApprovalConfirm} onReject={handleRejectReason} title="Approval Waste Form" itemName={selectedWaste === null || selectedWaste === void 0 ? void 0 : selectedWaste.branch_name} itemValue={selectedWaste === null || selectedWaste === void 0 ? void 0 : selectedWaste.total_value} loading={submitting}/>
    </Layout_1.default>);
}
