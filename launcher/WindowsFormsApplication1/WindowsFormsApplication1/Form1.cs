using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Diagnostics;
using Microsoft.Win32;
using System.Security.Principal;
using System.IO;

namespace WindowsFormsApplication1
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {

            Process.Start("main.exe");
        }

        private void radioButton1_CheckedChanged(object sender, EventArgs e)
        {
            addResolution(1);
        }

        private void notifyIcon1_MouseDoubleClick(object sender, MouseEventArgs e)
        {

        }

        private void button2_Click(object sender, EventArgs e)
        {
            
            Application.Exit();
        }

        private void radioButton3_CheckedChanged(object sender, EventArgs e)
        {
            addResolution(3);
        }

        private static bool IsAdministrator()
        {
            return (new WindowsPrincipal(WindowsIdentity.GetCurrent())).IsInRole(WindowsBuiltInRole.Administrator);
        }

        private void setWindowMode(Boolean minimized)
        {
            RegistryKey reg = Registry.CurrentUser;
            RegistryKey subKey = reg.OpenSubKey(@"Software\Webzen\MU\Config", true);

            int valor = minimized ? 1 : 0;

            if (subKey == null)
            {
                RegistryKey newKey = reg.CreateSubKey(@"Software\Webzen\MU\Config");
                newKey.SetValue("WindowMode", valor, RegistryValueKind.DWord);
                newKey.Close();
            }
            else
            {
                subKey.SetValue("WindowMode", valor, RegistryValueKind.DWord);
                subKey.Close();
            }
        }

        private void removeID()
        {
            RegistryKey reg = Registry.CurrentUser;
            RegistryKey subKey = reg.OpenSubKey(@"Software\Webzen\MU\Config", true);

            if (subKey != null)
            {
                Object id = subKey.GetValue("ID");
                if (id != null)
                {
                    subKey.DeleteValue("ID");
                }

            }
        }
        private void addResolution(int id)
        {
            RegistryKey reg = Registry.CurrentUser;
            RegistryKey subKey = reg.OpenSubKey(@"Software\Webzen\MU\Config", true);

            if (subKey == null)
            {
                RegistryKey newKey = reg.CreateSubKey(@"Software\Webzen\MU\Config");
                newKey.SetValue("Resolution", id, RegistryValueKind.DWord);
                newKey.Close();
            }
            else
            {
                subKey.SetValue("Resolution", id, RegistryValueKind.DWord);
                subKey.Close();
            }
        }

        private void radioButton2_CheckedChanged(object sender, EventArgs e)
        {
            addResolution(2);
        }

        private void checkBox1_CheckedChanged(object sender, EventArgs e)
        {
            setWindowMode(!checkBox1.Checked);
        }

        private void Form1_Load(object sender, EventArgs e)
        {

                setWindowMode(false);
                radioButton3.Checked = true;
                checkBox1.Checked = true;
                addResolution(3);
                removeID();



        }


        private void radioButton2_CheckedChanged_1(object sender, EventArgs e)
        {
            addResolution(1);
        }

        private void radio1280_CheckedChanged(object sender, EventArgs e)
        {
            addResolution(2);
        }

        private void radioButton3_CheckedChanged_1(object sender, EventArgs e)
        {
            addResolution(3);
        }
    }
}
